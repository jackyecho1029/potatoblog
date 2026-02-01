#!/usr/bin/env python3
"""
AI News Scraper - 抓取 AI 应用和营销资讯的工具
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

import feedparser
import requests
from bs4 import BeautifulSoup
import yaml

# 配置文件路径
CONFIG_FILE = Path(__file__).parent / "config.yaml"
DATA_DIR = Path(__file__).parent / "data"


class AINewsScraper:
    """AI 新闻抓取器"""

    def __init__(self, config_file: str = None):
        """初始化抓取器"""
        self.config = self._load_config(config_file)
        self.data_dir = DATA_DIR
        self.data_dir.mkdir(exist_ok=True)
        self.all_articles = []

    def _load_config(self, config_file: str = None) -> Dict:
        """加载配置文件"""
        config_path = Path(config_file) if config_file else CONFIG_FILE
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}

    def scrape_rss(self) -> List[Dict[str, Any]]:
        """抓取 RSS 源"""
        articles = []
        rss_sources = self.config.get('rss_sources', [])

        print(f"\n📡 开始抓取 {len(rss_sources)} 个 RSS 源...")

        for source in rss_sources:
            name = source.get('name', 'Unknown')
            url = source.get('url')
            if not url:
                continue

            try:
                print(f"  抓取: {name}")
                feed = feedparser.parse(url)

                for entry in feed.entries[:self.config.get('max_articles_per_feed', 10)]:
                    article = {
                        'title': entry.get('title', ''),
                        'link': entry.get('link', ''),
                        'summary': self._clean_html(entry.get('summary', entry.get('description', ''))),
                        'published': self._parse_date(entry.get('published', '')),
                        'source': name,
                        'source_type': 'RSS',
                        'scraped_at': datetime.now().isoformat()
                    }
                    articles.append(article)
            except Exception as e:
                print(f"  ❌ {name} 抓取失败: {e}")

        return articles

    def scrape_reddit(self) -> List[Dict[str, Any]]:
        """抓取 Reddit"""
        articles = []
        subreddits = self.config.get('reddit_subreddits', [])

        if not subreddits:
            return articles

        print(f"\n👾 开始抓取 Reddit...")

        # Reddit 公开 RSS 不需要 API key
        for subreddit in subreddits:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/hot.rss"
                print(f"  抓取: r/{subreddit}")
                feed = feedparser.parse(url)

                for entry in feed.entries[:self.config.get('max_articles_per_feed', 10)]:
                    article = {
                        'title': entry.get('title', ''),
                        'link': entry.get('link', ''),
                        'summary': self._clean_html(entry.get('summary', '')),
                        'published': self._parse_date(entry.get('published', '')),
                        'source': f'reddit/r/{subreddit}',
                        'source_type': 'Reddit',
                        'scraped_at': datetime.now().isoformat()
                    }
                    articles.append(article)
            except Exception as e:
                print(f"  ❌ r/{subreddit} 抓取失败: {e}")

        return articles

    def _clean_html(self, html: str) -> str:
        """清理 HTML 标签"""
        if not html:
            return ""
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(strip=True)[:500]

    def _parse_date(self, date_str: str) -> str:
        """解析日期"""
        try:
            dt = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
            return dt.isoformat()
        except:
            return date_str

    def run(self):
        """运行抓取"""
        print("🚀 AI News Scraper 启动...")
        print(f"📅 时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # 抓取各个源
        self.all_articles.extend(self.scrape_rss())
        self.all_articles.extend(self.scrape_reddit())

        # 去重
        seen = set()
        unique_articles = []
        for article in self.all_articles:
            key = article['title'] + article['link']
            if key not in seen:
                seen.add(key)
                unique_articles.append(article)

        self.all_articles = unique_articles

        print(f"\n✅ 共抓取到 {len(self.all_articles)} 条资讯")

        # 保存数据
        self._save_json()
        self._save_markdown()

    def _save_json(self):
        """保存为 JSON"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = self.data_dir / f"ai_news_{timestamp}.json"

        data = {
            'scraped_at': datetime.now().isoformat(),
            'total_articles': len(self.all_articles),
            'articles': self.all_articles
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 同时保存为 latest.json
        latest_file = self.data_dir / "latest.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"💾 JSON 已保存: {filename}")

    def _save_markdown(self):
        """保存为 Markdown"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        filename = self.data_dir / f"ai_news_{datetime.now().strftime('%Y%m%d')}.md"

        # 按来源分组
        by_source = {}
        for article in self.all_articles:
            source = article['source']
            if source not in by_source:
                by_source[source] = []
            by_source[source].append(article)

        # 生成 Markdown
        content = f"# AI 资讯日报\n\n"
        content += f"**抓取时间**: {timestamp}\n"
        content += f"**文章数量**: {len(self.all_articles)} 篇\n\n---\n\n"

        for source, articles in by_source.items():
            content += f"## {source}\n\n"
            for article in articles:
                content += f"### {article['title']}\n\n"
                if article['summary']:
                    content += f"**摘要**: {article['summary']}\n\n"
                content += f"- **链接**: [{article['link']}]({article['link']})\n"
                content += f"- **时间**: {article['published']}\n\n"

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

        # 同时保存为 daily.md
        daily_file = self.data_dir / "daily.md"
        with open(daily_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"📄 Markdown 已保存: {filename}")


def main():
    """主函数"""
    scraper = AINewsScraper()
    scraper.run()


if __name__ == '__main__':
    main()
