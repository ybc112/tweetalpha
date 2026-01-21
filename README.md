# TweetAlpha 🚀

> Your Alpha Radar for Trends.fun Ecosystem

TweetAlpha 是为 Trends.fun 生态打造的智能 Alpha 挖掘工具，帮助用户在代币爆发前捕捉机会。

## 🎯 核心功能

- **🔥 热度预警系统**: 在推文被代币化前识别潜力内容
- **💰 聪明钱追踪**: 实时跟踪高胜率钱包的买入动态
- **📊 代币分析仪表盘**: 实时排行榜、风险评分、一键交易
- **🤖 AI 助手**: 自然语言查询和智能分析
- **📱 推送服务**: Telegram/Discord 即时通知

## 🏗️ 技术架构

```
数据源层: Helius + Birdeye + Moralis
    ↓
后端服务: Node.js + TypeScript
    ↓
应用层: Web App + Telegram Bot
```

## 📦 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填入你的 API Keys:

```bash
cp .env.example .env
```

需要获取的 API Keys:
- **Helius**: https://helius.dev (Solana链上数据)
- **Birdeye**: https://bds.birdeye.so (代币价格)
- **Moralis**: https://developers.moralis.com (新币列表)
- **Telegram**: @BotFather (推送通知)

### 3. 测试 API 连接

```bash
npm run test:api
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将运行在 http://localhost:3000

## 📁 项目结构

```
tweetalpha/
├── src/
│   ├── services/          # 各API服务
│   │   ├── helius/        # Solana链上数据
│   │   ├── birdeye/       # 代币价格
│   │   ├── moralis/       # 新币列表
│   │   └── telegram/      # TG机器人
│   ├── utils/             # 工具函数
│   ├── routes/            # API路由
│   ├── types/             # TypeScript类型定义
│   └── index.ts           # 入口文件
├── .env                   # 环境变量
├── package.json
└── README.md
```

## 🛠️ 可用命令

- `npm run dev` - 启动开发服务器（热重载）
- `npm run build` - 构建生产版本
- `npm start` - 运行生产版本
- `npm run test:api` - 测试所有 API 连接

## 📅 开发路线图

- [x] Day 1: 项目初始化 + API 配置
- [ ] Day 2: 数据采集模块
- [ ] Day 3-4: 核心功能开发
- [ ] Day 5-6: 前端界面 + 推送系统
- [ ] Day 7: 测试优化 + Demo 准备
- [ ] Day 8: 提交 + 宣传

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

---

Built with ❤️ for Solana Hackathon
