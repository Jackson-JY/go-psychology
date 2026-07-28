import os
import json
import base64
import re
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import modal

app = FastAPI(title="Go Board SGF Converter", description="Convert Go board screenshots to SGF files")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_BASE_URL = os.environ.get("VISION_BASE_URL", "https://api.openai.com")
DEFAULT_MODEL = os.environ.get("VISION_MODEL", "gpt-4o")
TIMEOUT_SECONDS = 60


class VisionMove(BaseModel):
    moveNumber: int
    color: str
    coord: str
    estimated: Optional[bool] = False


class VisionResponse(BaseModel):
    boardSize: int
    hasMoveNumbers: bool
    moves: List[VisionMove]
    blackStones: List[str]
    whiteStones: List[str]
    sgf: Optional[str] = None
    notes: Optional[str] = None


class AnalyzeResponse(BaseModel):
    success: bool
    sgf: str
    boardSize: int
    hasMoveNumbers: bool
    moveCount: int
    notes: Optional[str] = None
    source: str


SYSTEM_PROMPT = """You are a Go (Weiqi/Baduk) board image analyzer. Your task is to analyze Go board screenshots and extract accurate position information.

Follow these rules strictly:
1. Determine the board size (9x9, 13x13, or 19x19). Most common is 19x19.
2. Identify EVERY stone on the board and its color (black or white).
3. If stones have move numbers visible on them, record the moves in order with their numbers.
4. Pay close attention to the numbers on stones - they indicate the order of play.
5. If NO move numbers are visible, try to estimate move order based on Go opening theory (corners first, then sides, then center). Mark estimated moves with "estimated": true.
6. Coordinates use SGF format: 'a' = first line (column/row 1). For 19x19, columns a-s and rows a-s.
   - 'aa' = top-left corner from viewer's perspective
   - 'ss' = bottom-right corner
   - First letter is column (horizontal), second letter is row (vertical)
7. Black plays first, then White, alternating.
8. Return ONLY valid JSON, no markdown code blocks or other text.

Output JSON structure:
{
  "boardSize": 19,
  "hasMoveNumbers": true,
  "moves": [
    {"moveNumber": 1, "color": "B", "coord": "dd", "estimated": false},
    {"moveNumber": 2, "color": "W", "coord": "qq", "estimated": false}
  ],
  "blackStones": ["dd", "qq", "dp"],
  "whiteStones": ["pd", "dq", "pp"],
  "sgf": "(;SZ[19]KM[7.5];B[dd];W[qq];B[dp]...)",
  "notes": "Any observations about the board position or recognition quality"
}

If you cannot determine move order, return hasMoveNumbers: false and empty moves array, but still include all stones in blackStones/whiteStones.
"""


def parse_vision_json(content: str) -> dict:
    text = content.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE)
        text = re.sub(r"```$", "", text, flags=re.IGNORECASE)
        text = text.strip()
    try:
        obj = json.loads(text)
        if not obj.get("boardSize") or not isinstance(obj.get("blackStones", []), list):
            raise ValueError("Missing required fields")
        return obj
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse failed: {str(e)}")


async def analyze_with_vision_api(base64_image: str) -> dict:
    api_key = os.environ.get("VISION_API_KEY")
    if not api_key:
        raise ValueError("VISION_API_KEY not configured")

    base_url = os.environ.get("VISION_BASE_URL", DEFAULT_BASE_URL)
    model = os.environ.get("VISION_MODEL", DEFAULT_MODEL)

    import httpx

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{base_url}/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this Go board image carefully. Identify all stones and their move numbers if visible. Return the JSON response.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": base64_image, "detail": "high"},
                            },
                        ],
                    },
                ],
                "temperature": 0.2,
                "max_tokens": 4000,
                "response_format": {"type": "json_object"},
            },
        )

        if response.status_code != 200:
            raise ValueError(f"Vision API HTTP {response.status_code}: {response.text}")

        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            raise ValueError("Vision API returned empty content")

        return parse_vision_json(content)


def build_sgf_from_result(result: dict) -> str:
    board_size = result.get("boardSize", 19)
    moves = result.get("moves", [])
    black_stones = result.get("blackStones", [])
    white_stones = result.get("whiteStones", [])

    if moves and len(moves) > 0:
        sgf = f"(;GM[1]FF[4]SZ[{board_size}]KM[7.5]"
        sorted_moves = sorted(moves, key=lambda m: m.get("moveNumber", 0))
        for m in sorted_moves:
            color = m.get("color", "B")
            coord = m.get("coord", "")
            if coord:
                sgf += f";{color}[{coord}]"
        sgf += ")"
        return sgf

    sgf = f"(;GM[1]FF[4]SZ[{board_size}]KM[7.5]"
    max_len = max(len(black_stones), len(white_stones))
    for i in range(max_len):
        if i < len(black_stones):
            sgf += f";B[{black_stones[i]}]"
        if i < len(white_stones):
            sgf += f";W[{white_stones[i]}]"
    sgf += ")"
    return sgf


def get_mock_result() -> dict:
    return {
        "boardSize": 19,
        "hasMoveNumbers": True,
        "moves": [
            {"moveNumber": 1, "color": "B", "coord": "dd", "estimated": False},
            {"moveNumber": 2, "color": "W", "coord": "qq", "estimated": False},
            {"moveNumber": 3, "color": "B", "coord": "dp", "estimated": False},
            {"moveNumber": 4, "color": "W", "coord": "pd", "estimated": False},
            {"moveNumber": 5, "color": "B", "coord": "pp", "estimated": False},
            {"moveNumber": 6, "color": "W", "coord": "dq", "estimated": False},
            {"moveNumber": 7, "color": "B", "coord": "qf", "estimated": False},
            {"moveNumber": 8, "color": "W", "coord": "fq", "estimated": False},
            {"moveNumber": 9, "color": "B", "coord": "jc", "estimated": False},
            {"moveNumber": 10, "color": "W", "coord": "cj", "estimated": False},
            {"moveNumber": 11, "color": "B", "coord": "cn", "estimated": False},
            {"moveNumber": 12, "color": "W", "coord": "qn", "estimated": False},
            {"moveNumber": 13, "color": "B", "coord": "jq", "estimated": False},
            {"moveNumber": 14, "color": "W", "coord": "jp", "estimated": False},
            {"moveNumber": 15, "color": "B", "coord": "np", "estimated": False},
            {"moveNumber": 16, "color": "W", "coord": "pj", "estimated": False},
            {"moveNumber": 17, "color": "B", "coord": "qi", "estimated": False},
            {"moveNumber": 18, "color": "W", "coord": "ph", "estimated": False},
            {"moveNumber": 19, "color": "B", "coord": "nm", "estimated": False},
            {"moveNumber": 20, "color": "W", "coord": "mj", "estimated": False},
        ],
        "blackStones": ["dd", "dp", "pp", "qf", "jc", "cn", "jq", "np", "qi", "nm"],
        "whiteStones": ["qq", "pd", "dq", "fq", "cj", "qn", "jp", "pj", "ph", "mj"],
        "sgf": "(;SZ[19]KM[7.5];B[dd];W[qq];B[dp];W[pd];B[pp];W[dq];B[qf];W[fq];B[jc];W[cj];B[cn];W[qn];B[jq];W[jp];B[np];W[pj];B[qi];W[ph];B[nm];W[mj])",
        "notes": "Mock analysis result - VISION_API_KEY not configured",
    }


@app.get("/health")
async def health_check():
    has_key = bool(os.environ.get("VISION_API_KEY"))
    return {
        "status": "ok",
        "service": "go-sgf-converter",
        "vision_api_configured": has_key,
        "model": os.environ.get("VISION_MODEL", DEFAULT_MODEL),
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(
    image: UploadFile = File(..., description="Go board screenshot image"),
    return_sgf_file: bool = Form(False, description="Return SGF as downloadable file"),
):
    if not image:
        raise HTTPException(status_code=400, detail="No image provided")

    content = await image.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")

    content_type = image.content_type or "image/png"
    base64_data = base64.b64encode(content).decode("utf-8")
    base64_image = f"data:{content_type};base64,{base64_data}"

    has_key = bool(os.environ.get("VISION_API_KEY"))

    try:
        if has_key:
            result = await analyze_with_vision_api(base64_image)
            source = "vision"
        else:
            result = get_mock_result()
            source = "mock"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    sgf = result.get("sgf", "")
    if not sgf or "SZ[" not in sgf:
        sgf = build_sgf_from_result(result)

    move_count = len(result.get("moves", [])) or (
        len(result.get("blackStones", [])) + len(result.get("whiteStones", []))
    )

    return AnalyzeResponse(
        success=True,
        sgf=sgf,
        boardSize=result.get("boardSize", 19),
        hasMoveNumbers=result.get("hasMoveNumbers", False),
        moveCount=move_count,
        notes=result.get("notes"),
        source=source,
    )


@app.post("/analyze-base64", response_model=AnalyzeResponse)
async def analyze_base64_image(body: dict):
    image_b64 = body.get("image", "")
    if not image_b64:
        raise HTTPException(status_code=400, detail="No image provided")

    if not image_b64.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid image format, must be data URL")

    has_key = bool(os.environ.get("VISION_API_KEY"))

    try:
        if has_key:
            result = await analyze_with_vision_api(image_b64)
            source = "vision"
        else:
            result = get_mock_result()
            source = "mock"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    sgf = result.get("sgf", "")
    if not sgf or "SZ[" not in sgf:
        sgf = build_sgf_from_result(result)

    move_count = len(result.get("moves", [])) or (
        len(result.get("blackStones", [])) + len(result.get("whiteStones", []))
    )

    return AnalyzeResponse(
        success=True,
        sgf=sgf,
        boardSize=result.get("boardSize", 19),
        hasMoveNumbers=result.get("hasMoveNumbers", False),
        moveCount=move_count,
        notes=result.get("notes"),
        source=source,
    )


modal_image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "fastapi",
    "uvicorn",
    "httpx",
    "python-multipart",
    "pydantic",
)

stub = modal.Stub("go-sgf-converter")

@stub.function(
    image=modal_image,
    secrets=[modal.Secret.from_name("go-vision-api")],
    timeout=120,
    keep_warm=1,
)
@modal.asgi_app()
def fastapi_app():
    return app
