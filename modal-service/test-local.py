#!/usr/bin/env python3
"""
本地测试脚本：测试围棋截图转 SGF 服务
使用方法：
    python test-local.py [image-path]
"""

import sys
import base64
import json
import httpx


def test_health(base_url: str = "http://localhost:8000"):
    """测试健康检查接口"""
    print("=== 测试健康检查接口 ===")
    try:
        response = httpx.get(f"{base_url}/health")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"请求失败: {e}")
        return False


def test_analyze_upload(image_path: str, base_url: str = "http://localhost:8000"):
    """测试文件上传分析接口"""
    print(f"\n=== 测试文件上传分析: {image_path} ===")
    try:
        with open(image_path, "rb") as f:
            files = {"image": ("board.png", f, "image/png")}
            response = httpx.post(
                f"{base_url}/analyze",
                files=files,
                timeout=120,
            )
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"成功: {result.get('success')}")
        print(f"棋盘大小: {result.get('boardSize')}")
        print(f"是否有手数: {result.get('hasMoveNumbers')}")
        print(f"落子数: {result.get('moveCount')}")
        print(f"来源: {result.get('source')}")
        print(f"备注: {result.get('notes')}")
        print(f"SGF 前100字符: {result.get('sgf', '')[:100]}...")
        return result
    except Exception as e:
        print(f"请求失败: {e}")
        return None


def test_analyze_base64(image_path: str, base_url: str = "http://localhost:8000"):
    """测试 base64 分析接口"""
    print(f"\n=== 测试 base64 分析: {image_path} ===")
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
            base64_data = base64.b64encode(image_data).decode("utf-8")
            data_url = f"data:image/png;base64,{base64_data}"

        response = httpx.post(
            f"{base_url}/analyze-base64",
            json={"image": data_url},
            timeout=120,
        )
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"成功: {result.get('success')}")
        print(f"棋盘大小: {result.get('boardSize')}")
        print(f"落子数: {result.get('moveCount')}")
        print(f"来源: {result.get('source')}")
        return result
    except Exception as e:
        print(f"请求失败: {e}")
        return None


def save_sgf(result: dict, output_path: str = "output.sgf"):
    """保存 SGF 到文件"""
    if result and result.get("success") and result.get("sgf"):
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result["sgf"])
        print(f"\nSGF 已保存到: {output_path}")
        return True
    return False


def main():
    base_url = "http://localhost:8000"
    image_path = None

    if len(sys.argv) > 1:
        image_path = sys.argv[1]

    if len(sys.argv) > 2:
        base_url = sys.argv[2]

    print(f"服务地址: {base_url}")
    print()

    test_health(base_url)

    if image_path:
        result = test_analyze_upload(image_path, base_url)
        if result:
            save_sgf(result, "output.sgf")

        test_analyze_base64(image_path, base_url)
    else:
        print("\n提示: 传入图片路径可测试分析功能")
        print("  python test-local.py path/to/board.png")


if __name__ == "__main__":
    main()
