#!/bin/bash
set -e

echo "=============================================="
echo "  黑白潜意识 - 腾讯云一键部署脚本"
echo "=============================================="
echo ""

APP_DIR="/var/www/go-psychology"
LOG_DIR="$APP_DIR/logs"
DEPLOY_MODE=${1:-"git"}
REPO_URL=${2:-"https://github.com/your-username/go-psychology.git"}

echo "[1/8] 更新系统软件包..."
export DEBIAN_FRONTEND=noninteractive
sudo apt update -y && sudo apt upgrade -y -o Dpkg::Options::="--force-confold"
echo "   ✓ 系统已更新"

echo "[2/8] 安装 Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
echo "   ✓ Node.js 安装完成"

echo "[3/8] 安装 PM2..."
sudo npm install -g pm2
pm2 --version
echo "   ✓ PM2 安装完成"

echo "[4/8] 安装 Nginx..."
sudo apt install -y nginx
sudo nginx -v
echo "   ✓ Nginx 安装完成"

echo "[5/8] 创建应用目录并拉取代码..."
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

if [ "$DEPLOY_MODE" == "local" ]; then
    echo "   ✓ 使用本地已上传的代码包，跳过 git 拉取"
elif [ ! -d "$APP_DIR/.git" ]; then
    git clone "$REPO_URL" "$APP_DIR"
    echo "   ✓ 代码已克隆"
else
    cd "$APP_DIR"
    git pull origin main
    echo "   ✓ 代码已更新"
fi

mkdir -p "$LOG_DIR"

echo "[6/8] 安装依赖并构建..."
cd "$APP_DIR"
npm ci
npm run build
echo "   ✓ 构建完成"

echo "[7/8] 配置 Nginx..."
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/go-psychology
sudo ln -sf /etc/nginx/sites-available/go-psychology /etc/nginx/sites-enabled/go-psychology
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "   ✓ Nginx 配置完成"

echo "[8/8] 启动 API 服务..."
cd "$APP_DIR"
pm2 delete go-psychology-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$USER" --hp "$HOME" || true
echo "   ✓ API 服务已启动"

echo ""
echo "=============================================="
echo "  🎉 部署完成！"
echo "=============================================="
echo ""
echo "  访问地址: http://$(curl -s ifconfig.me)"
echo ""
echo "  常用命令:"
echo "    pm2 logs go-psychology-api    # 查看日志"
echo "    pm2 restart go-psychology-api # 重启服务"
echo "    pm2 status                    # 查看状态"
echo ""
echo "  配置 DeepSeek Key:"
echo "    cd $APP_DIR"
echo "    cp .env.example .env"
echo "    # 编辑 .env 填入 DEEPSEEK_API_KEY"
echo "    pm2 restart go-psychology-api"
echo ""
