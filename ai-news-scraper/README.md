# AI News Scraper

一个用于抓取网络上 AI 应用和 AI 营销相关资讯的工具。

## 功能特性

- 📡 从多个 RSS 源抓取新闻
- 👾 从 Reddit 社区获取讨论
- 💾 支持保存为 JSON 和 Markdown 格式
- ⏰ 支持定时自动抓取
- 🎯 专注 AI 应用和 AI 营销资讯

## 安装

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/ai-news-scraper.git
cd ai-news-scraper
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 单次运行

```bash
python scraper.py
```

### 定时运行

```bash
python scheduler.py
```

默认每 2 小时自动抓取一次，按 `Ctrl+C` 退出。

## 配置

编辑 `config.yaml` 文件来自定义：

- `max_articles_per_feed`: 每个 RSS 源最多抓取的文章数
- `rss_sources`: RSS 源列表，可添加或删除
- `reddit_subreddits`: Reddit 子版块列表

## 数据输出

抓取的数据会保存在 `data/` 目录下：

- `ai_news_YYYYMMDD_HHMMSS.json` - 带时间戳的 JSON 文件
- `latest.json` - 最新抓取结果的 JSON
- `ai_news_YYYYMMDD.md` - 每日 Markdown 报告
- `daily.md` - 最新 Markdown 报告

## 数据源

当前配置的数据源包括：

### RSS 源
- 机器之心
- 量子位
- TechCrunch AI
- MIT Technology Review
- OpenAI Blog
- Google AI Blog
- DeepMind Blog
- Anthropic Blog
- Marketing AI Institute
- 更多...

### Reddit
- r/artificial
- r/MachineLearning
- r/OpenAI
- r/ArtificialIntelligence
- r/ChatGPT
- r/stablediffusion
- 更多...

## 添加更多数据源

在 `config.yaml` 中添加新的 RSS 源：

```yaml
rss_sources:
  - name: "你的源名称"
    url: "https://example.com/feed"
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
