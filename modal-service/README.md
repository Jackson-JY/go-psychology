# 围棋截图转 SGF - Modal 部署服务

基于 Modal.com 的 Serverless 服务，通过多模态大模型 API 将围棋棋盘截图（带手数）转换为 SGF 文件。

## 功能特性

- 🎯 支持 9/13/19 路棋盘识别
- 🔢 自动识别棋子上的手数编号
- 📝 生成标准 SGF 格式文件
- 🚀 Modal Serverless 部署，按需付费
- 🔌 OpenAI 兼容 API，支持多种模型
- 📱 提供 HTTP API，支持文件上传和 base64 两种方式

## 项目结构

```
modal-service/
├── app.py              # 主服务代码 (FastAPI + Modal)
├── requirements.txt    # Python 依赖
├── .env.example        # 环境变量示例
├── deploy-modal.sh     # 部署到 Modal 的脚本
├── run-local.sh        # 本地开发运行脚本
├── test-local.py       # 本地测试脚本
└── test-modal.py       # Modal 服务测试脚本
```

## 快速开始

### 1. 前置准备

- Python 3.10+
- Modal 账号 (https://modal.com)
- 视觉 API 密钥 (OpenAI / DeepSeek / 通义千问等)

### 2. 安装依赖

```bash
cd modal-service
pip install -r requirements.txt
```

### 3. 本地测试

```bash
# 复制环境变量配置
cp .env.example .env
# 编辑 .env，填入 VISION_API_KEY 等配置

# 启动本地服务
./run-local.sh

# 另开终端，测试服务
python test-local.py
# 或指定图片测试
python test-local.py path/to/board.png
```

访问 http://localhost:8000/docs 查看 API 文档。

### 4. 部署到 Modal

```bash
# 登录 Modal
modal setup

# 配置 Secret (包含 API 密钥)
modal secret create go-vision-api
# 按提示输入 VISION_API_KEY 等环境变量

# 部署服务
./deploy-modal.sh
```

部署成功后，Modal 会给出服务 URL，格式类似：
`https://your-workspace--go-sgf-converter-fastapi-app.modal.run`

### 5. 测试 Modal 服务

```bash
python test-modal.py <你的-modal-url>
# 或带图片测试
python test-modal.py <你的-modal-url> path/to/board.png
```

## API 接口

### GET /health

健康检查接口

**响应示例：**
```json
{
  "status": "ok",
  "service": "go-sgf-converter",
  "vision_api_configured": true,
  "model": "gpt-4o"
}
```

### POST /analyze

上传图片文件进行分析，返回 SGF

**请求：** `multipart/form-data`
- `image`: 图片文件 (PNG/JPG，最大 10MB)

**响应示例：**
```json
{
  "success": true,
  "sgf": "(;GM[1]FF[4]SZ[19]KM[7.5];B[dd];W[qq]...)",
  "boardSize": 19,
  "hasMoveNumbers": true,
  "moveCount": 30,
  "notes": "识别结果备注",
  "source": "vision"
}
```

### POST /analyze-base64

通过 base64 data URL 进行分析

**请求体：**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**响应：** 同 `/analyze`

## 环境变量

| 变量名 | 必填 | 说明 | 默认值 |
|--------|------|------|--------|
| VISION_API_KEY | 是 | 视觉 API 密钥 | - |
| VISION_BASE_URL | 否 | API 基础地址 | https://api.openai.com |
| VISION_MODEL | 否 | 使用的模型名称 | gpt-4o |

### 支持的 API 服务商

任何 OpenAI 兼容的多模态 API 都可以使用：

- **OpenAI**: `gpt-4o`, `gpt-4o-mini`
- **DeepSeek**: `deepseek-vl2` (base URL: https://api.deepseek.com)
- **通义千问**: `qwen-vl-plus` (base URL: https://dashscope.aliyuncs.com/compatible-mode/v1)
- **智谱清言**: `glm-4v` (base URL: https://open.bigmodel.cn/api/paas/v4)

## Modal 配置说明

### Secret 管理

服务通过 Modal Secret 管理敏感信息。Secret 名称为 `go-vision-api`，包含：

```
VISION_API_KEY=sk-...
VISION_BASE_URL=https://api.openai.com
VISION_MODEL=gpt-4o
```

创建方式：
```bash
modal secret create go-vision-api
```

### 函数配置

在 [app.py](app.py) 中可以调整以下参数：

```python
@stub.function(
    image=modal_image,
    secrets=[modal.Secret.from_name("go-vision-api")],
    timeout=120,       # 超时时间（秒）
    keep_warm=1,       # 保温实例数（设为 0 可节省成本）
    memory=1024,       # 内存大小（MB）
    cpu=1.0,           # CPU 数量
)
```

## 成本估算

Modal 按使用量计费，主要成本来自：
- CPU 运行时间
- 内存使用
- 网络流量

视觉 API 调用费用取决于你使用的服务商和模型。

## 常见问题

### Q: 没有 VISION_API_KEY 可以测试吗？

可以。未配置 API Key 时服务会返回 Mock 数据，用于测试接口连通性。

### Q: 识别准确率不高怎么办？

1. 使用更高清的截图
2. 确保棋盘在图片中居中且完整
3. 尝试使用更强的模型（如 gpt-4o）
4. 调整 prompt 中的识别规则

### Q: 支持哪些图片格式？

支持 PNG、JPG、WebP 等常见图片格式，最大 10MB。

### Q: 如何更新服务？

重新运行 `./deploy-modal.sh` 即可，Modal 会进行蓝绿部署，无停机更新。

## 相关链接

- Modal 文档: https://modal.com/docs
- FastAPI 文档: https://fastapi.tiangolo.com
- SGF 格式规范: https://www.red-bean.com/sgf/
