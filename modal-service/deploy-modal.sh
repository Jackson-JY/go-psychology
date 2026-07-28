#!/bin/bash
#
# 围棋截图转 SGF 服务 - Modal 部署脚本
# 使用方法: ./deploy-modal.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "  围棋截图转 SGF 服务 - Modal 部署"
echo "========================================="
echo ""

# 检查 modal CLI 是否已安装
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI 未安装"
    echo ""
    echo "请先安装 Modal CLI:"
    echo "  pip install modal"
    echo ""
    echo "然后登录 Modal:"
    echo "  modal setup"
    echo ""
    exit 1
fi

echo "✅ Modal CLI 已安装"
echo ""

# 检查是否已登录
if ! modal profile current &> /dev/null; then
    echo "⚠️  未检测到 Modal 登录状态"
    echo "请运行 'modal setup' 进行登录"
    exit 1
fi

echo "✅ Modal 已登录"
echo ""

# 检查 Secret 配置
echo "检查 Secret 配置..."
echo ""

if modal secret list 2>/dev/null | grep -q "go-vision-api"; then
    echo "✅ Secret 'go-vision-api' 已存在"
else
    echo "⚠️  Secret 'go-vision-api' 不存在"
    echo ""
    echo "创建 Secret 需要以下环境变量:"
    echo "  - VISION_API_KEY (视觉 API 密钥)"
    echo "  - VISION_BASE_URL (API 基础地址，可选)"
    echo "  - VISION_MODEL (模型名称，可选)"
    echo ""
    read -p "是否现在创建 Secret? (y/N): " create_secret
    if [[ "$create_secret" =~ ^[Yy]$ ]]; then
        echo ""
        echo "创建 Secret 'go-vision-api'..."
        modal secret create go-vision-api
        echo "✅ Secret 创建完成"
    else
        echo ""
        echo "跳过 Secret 创建，稍后可手动创建:"
        echo "  modal secret create go-vision-api"
    fi
fi

echo ""
echo "========================================="
echo "  开始部署服务"
echo "========================================="
echo ""

# 部署到 Modal
echo "正在部署服务到 Modal..."
echo ""

modal deploy app.py

echo ""
echo "========================================="
echo "  部署完成!"
echo "========================================="
echo ""
echo "查看已部署的服务:"
echo "  modal app list"
echo ""
echo "查看服务日志:"
echo "  modal logs go-sgf-converter"
echo ""
echo "测试服务:"
echo "  python test-modal.py <modal-url> [image-path]"
echo ""
