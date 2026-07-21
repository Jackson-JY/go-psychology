#!/bin/bash
set -e

APP_DIR="/var/www/go-psychology"

echo ">> 拉取最新代码..."
cd "$APP_DIR"
git pull origin main

echo ">> 安装依赖..."
npm ci

echo ">> 构建..."
npm run build

echo ">> 重启服务..."
pm2 restart ecosystem.config.cjs

echo ""
echo "✅ 更新完成，服务已重启"
