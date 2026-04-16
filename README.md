# 🛒 AI 电商内容工坊

> 一款面向电商商家的 AI 驱动内容生成工具，支持**商品主图**、**种草文案**、**短视频脚本**三大核心功能，一站式解决电商内容生产难题。

---

## 🎯 功能模块

### 📸 模块 1：AI 商品多角度图
- 上传 1 张商品图片（白底图效果最佳）
- AI 自动生成 6 个视角：正面图 / 侧面图 / 背面图 / 45° 视角 / 俯视图 / 细节图
- 支持多角度同时生成，下载后直接用于电商平台商品详情页

### ✍️ 模块 2：AI 种草文案
- 输入商品描述或链接
- 支持三种平台风格一键切换：
  - 📕 **小红书** — 有感染力的种草文案，带 emoji 和互动引导
  - 🎵 **抖音** — 强节奏感带货脚本，前 3 秒抓眼球 + 促单话术
  - 🌟 **微博** — 自然长图文风格，带话题标签
- 一键复制，直接粘贴到对应平台发布

### 🎬 模块 3：AI 短视频脚本 + 虚拟模特
- 选择场景类型：开箱展示 / 穿搭摆放 / 细节特写 / 场景带入
- AI 自动生成分镜脚本（时长规划 + 配音文案 + 镜头建议）
- 支持上传商品图，生成 AI 虚拟模特展示视频

---

## 🛠 技术架构

```
┌─────────────────┐
│   H5 前端       │  Next.js App Router
│  (移动优先 UI)   │  React 18 + TypeScript
└────────┬────────┘
         │  API Routes
┌────────▼────────┐
│   AI 网关层     │  Next.js API Routes
│  /api/ai/*     │  ━━━━━━━━━━━━━━━
└────────┬────────┘
         │  OpenClaw Gateway
┌────────▼────────┐
│  MiniMax AI    │  图像生成 · LLM · 视频生成
│  (图像/文案/视频) │
└────────────────┘
```

| 技术栈 | 说明 |
|--------|------|
| 前端 | Next.js 14 (App Router) + TypeScript |
| 样式 | 原生 CSS（移动端优先，响应式设计） |
| AI 能力 | MiniMax API（图像生成 / LLM / 图生视频） |
| 部署 | Vercel / 任意 Node.js 服务器 |

---

## 📦 安装与运行

### 前置依赖
- Node.js ≥ 18
- MiniMax API Key（如需接入真实 AI）

### 本地开发

```bash
# 克隆项目
git clone https://github.com/zhangweikang1228/BingoTool-.git
cd BingoTool-

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

### 生产构建

```bash
npm run build
npm start
```

### AI 能力配置

项目默认使用演示数据。接入真实 MiniMax AI：

1. 在 `/src/lib/ai.ts` 中配置 Gateway 地址和 Token
2. 或替换为你自己的 MiniMax API 调用

---

## 🔌 AI 接口说明

### 文案生成 `/api/ai/copy`
```json
POST /api/ai/copy
Body: { "product": "商品描述", "platform": "xiaohongshu|douyin|weibo" }
```

### 图像生成 `/api/ai/image`
```json
POST /api/ai/image
Body: { "imageUrl": "https://...", "angle": "front|side|back|angle45|top|detail" }
```

### 视频生成 `/api/ai/video`
```json
POST /api/ai/video
Body: { "imageUrl": "https://...", "duration": 6 }
```

---

## 📱 线上体验

> H5 版本（演示模式）：[https://bcrnrnvz9n26.space.minimaxi.com](https://bcrnrnvz9n26.space.minimaxi.com)

> Next.js 全栈版本（需配置 AI）：[https://mft184xgvv52.space.minimaxi.com](https://mft184xgvv52.space.minimaxi.com)

---

## 💡 使用场景

| 角色 | 痛点 | 使用方式 |
|------|------|---------|
| 淘宝/天猫卖家 | 主图拍摄成本高 | 上传白底图 → AI 生成多角度主图 |
| 抖音/小红书博主 | 内容生产效率低 | 输入商品 → 一键生成多平台文案 |
| 品牌方运营 | 私域内容匮乏 | 短视频脚本 + AI 模特视频 |

---

## 📄 License

MIT License · 欢迎 Star ⭐ 和 Fork

---

> Built with ❤️ by AI · Powered by MiniMax
