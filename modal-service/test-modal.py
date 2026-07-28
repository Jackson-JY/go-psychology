#!/usr/bin/env python3
"""
测试已部署到 Modal 的服务
使用方法：
    python test-modal.py [image-path] [modal-url]
"""

import sys
import base64
import json
import httpx


def test_health(modal_url: str):
    """测试健康检查接口"""
    print("=== 测试健康检查接口 ===")
    try:
        response = httpx.get(f"{modal_url}/health")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"请求失败: {e}")
        return False


def test_analyze_upload(image_path: str, modal_url: str):
    """测试文件上传分析接口"""
    print(f"\n=== 测试文件上传分析: {image_path} ===")
    try:
        with open(image_path, "rb") as f:
            files = {"image": ("board.png", f, "image/png")}
            response = httpx.post(
                f"{modal_url}/analyze",
                files=files,
                timeout=180,
            )
        print(f"状态码: {response.status_code}")
        result = response.json()
        print(f"成功: {result.get('success')}")
        print(f"棋盘大小: {result.get('boardSize')}")
        print(f"是否有手数: {result.get('hasMoveNumbers')}")
        print(f"落子数: {result.get('moveCount')}")
        print(f"来源: {result.get('source')}")
        print(f"备注: {result.get('notes')}")
        sgf = result.get('sgf', '')
        if len(sgf) > 100:
            print(f"SGF 前100字符: {sgf[:100]}...")
        else:
            print(f"SGF: {sgf}")
        return result
    except Exception as e:
        print(f"请求失败: {e}")
        import traceback
        traceback.print_exc()
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
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python test-modal.py <modal-url> [image-path]")
        print()
        print("示例:")
        print("  python test-modal.py https://your-workspace--go-sgf-converter-fastapi-app-dev.modal.run board.png")
        sys.exit(1)

    modal_url = sys.argv[1].rstrip("/")
    image_path = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"Modal 服务地址: {modal_url}")
    print()

    test_health(modal_url)

    if image_path:
        result = test_analyze_upload(image_path, modal_url)
        if result:
            save_sgf(result, "output.sgf")
    else:
        print("\n提示: 传入图片路径可测试分析功能")
        print("  python test-modal.py <modal-url> board.png")


if __name__ == "__main__":
    main()
