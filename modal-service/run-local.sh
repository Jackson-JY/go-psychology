#!/bin/bash
#
# 本地开发测试脚本
# 启动本地 FastAPI 服务用于测试
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "========================================="
echo "  围棋截图转 SGF - 本地开发服务"
echo "========================================="
echo ""

PORT="${PORT:-8000}"

echo "服务地址: http://localhost:$PORT"
echo "API 文档: http://localhost:$PORT/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

if [ -f .env ]; then
    echo "已加载 .env 配置文件"
else
    echo "⚠️  未找到 .env 文件，将使用 Mock 模式"
    echo "   复制 .env.example 为 .env 并配置 VISION_API_KEY"
fi

echo ""

uvicorn app:app --host 0.0.0.0 --port "$PORT" --reload
