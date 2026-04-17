# BingoTool - AI内容生成平台

一键生成商品主图、种草文案、短视频脚本，支持跨境电商多语言翻译。

## 功能特性

- 🖼️ **商品图生成** - AI自动生成精美商品主图
- ✍️ **种草文案** - 支持小红书、抖音、公众号等多平台
- 👗 **虚拟模特试穿** - 多肤色、多场景模特图
- 🌐 **多语言翻译** - 支持15+语种，助力跨境电商

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: CSS

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页
│   ├── login/page.tsx        # 登录页
│   ├── dashboard/page.tsx    # 仪表盘
│   ├── generate/              # 生成功能
│   │   ├── image/            # 商品图
│   │   ├── text/            # 种草文案
│   │   ├── model/            # 虚拟模特
│   │   └── translate/        # 翻译
│   └── api/                  # API接口
│       ├── auth/             # 鉴权
│       └── generate/         # 内容生成
└── app/globals.css          # 全局样式
```

## 环境变量

```env
# 暂无需配置的环境变量（MVP版本）
```

## 部署

支持 Vercel 一键部署。

## License

MIT
