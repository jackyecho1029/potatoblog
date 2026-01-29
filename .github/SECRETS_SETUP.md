# GitHub Actions 自动化配置指南

## 📋 需要配置的 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

### 1. YOUTUBE_API_KEY
- **获取方式**：从你的 `.env.local` 文件复制
- **值示例**：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 2. GEMINI_API_KEY
- **获取方式**：从你的 `.env.local` 文件复制
- **值示例**：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 3. YOUTUBE_CHANNELS
- **获取方式**：从你的 `.env.local` 文件复制
- **值示例**：`@melrobbins,@LennysPodcast,@timferriss,@DanKoeTalks,@b.cormier,@danielpinktv,@DanielPriestley,@CodieSanchezCT,@TinaHuang1,@howiaipodcast,@marthabeck,@tkppodcast`

---

## 🔧 配置步骤

### 1. 访问 GitHub 仓库设置
```
https://github.com/jackyecho1029/potatoblog/settings/secrets/actions
```

### 2. 点击 "New repository secret"

### 3. 添加每个 Secret
- Name: `YOUTUBE_API_KEY`
- Value: [从 .env.local 复制]
- 点击 "Add secret"

重复以上步骤添加 `GEMINI_API_KEY` 和 `YOUTUBE_CHANNELS`

---

## ✅ 测试自动化

### 手动触发测试
1. 访问：`https://github.com/jackyecho1029/potatoblog/actions`
2. 选择 "Update Learning Content" 工作流
3. 点击 "Run workflow" → "Run workflow"
4. 等待约 2-3 分钟，查看运行结果

### 检查结果
- ✅ 工作流成功运行（绿色勾）
- ✅ 有新的 commit（如果有新视频）
- ✅ Vercel 自动部署
- ✅ 访问 https://potatoecho.com/learning 查看新内容

---

## 📅 自动运行时间

- **定时任务**：每天北京时间 9:00（UTC 1:00）
- **手动触发**：随时可以在 GitHub Actions 页面手动运行

---

## 🐛 常见问题

### Q: 工作流失败了怎么办？
A: 查看 GitHub Actions 日志，通常是：
- API Key 配置错误
- npm 依赖安装失败
- 网络问题

### Q: 如何修改运行时间？
A: 编辑 `.github/workflows/update-learning.yml` 中的 cron 表达式
- `0 1 * * *` = 每天 UTC 1:00（北京时间 9:00）
- `0 1,13 * * *` = 每天 UTC 1:00 和 13:00（北京时间 9:00 和 21:00）

### Q: 如何暂停自动运行？
A: 在 GitHub Actions 页面禁用该工作流

---

## 🎯 下一步

配置完成后，你就可以：
1. **完全不用管**：每天自动抓取新视频
2. **随时查看**：访问 GitHub Actions 查看运行日志
3. **手动触发**：如果想立即更新，手动运行工作流

享受全自动的学习内容更新吧！🚀
