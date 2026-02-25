#!/usr/bin/env python3
"""
X Signal Daily Briefing - Python Version
使用 Nitter 公开 RSS 镜像抓取 X (Twitter) 内容，无需 API Key
按板块分类，每板块筛选 5-10 条高价值内容，生成中文摘要和行动建议
"""

import json
import os
import sys
import hashlib
import re
import time
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional
import feedparser
import requests

# ─── 路径配置 ─────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
BLOG_ROOT = SCRIPT_DIR.parent
POSTS_DIR = BLOG_ROOT / "posts" / "x-signals"
SOURCES_CONFIG = BLOG_ROOT / "config" / "x-sources-categorized.json"
ENV_FILE = BLOG_ROOT / ".env.local"

# ─── 读取环境变量 ──────────────────────────────────────────────────────────────

def load_env() -> Dict[str, str]:
    """读取 .env.local 文件"""
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

ENV = load_env()
GEMINI_API_KEY = ENV.get("GEMINI_API_KEY", "")
GLM_API_KEY = ENV.get("GLM_API_KEY", "")

# ─── Nitter 公开实例列表（自动轮换） ─────────────────────────────────────────

NITTER_INSTANCES = [
    "https://nitter.net",
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.1d4.us",
    "https://nitter.kavin.rocks",
    "https://nitter.unixfox.eu",
    "https://nitter.catsarch.com",
    "https://nitter.moomoo.me",
]

# ─── 去重工具 ─────────────────────────────────────────────────────────────────

def get_fingerprint(content: str) -> str:
    """对内容前100字符生成 md5 指纹，用于去重"""
    clean = re.sub(r'\s+', ' ', content[:100].lower().strip())
    return hashlib.md5(clean.encode()).hexdigest()

def load_existing_dedupe_set() -> set:
    """加载过去 7 天已发布内容的链接和指纹"""
    seen = set()
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(POSTS_DIR.glob("*.md"), reverse=True)[:7]
    for f in files:
        text = f.read_text(encoding="utf-8")
        # 收集链接
        for link in re.findall(r'https?://x\.com/\S+/status/\d+', text):
            seen.add(link)
        # 收集内容指纹
        for fp in re.findall(r'<!--fp:([a-f0-9]{32})-->', text):
            seen.add(fp)
    print(f"📚 去重库加载完成，共 {len(seen)} 条历史记录")
    return seen

# ─── Nitter RSS 抓取 ──────────────────────────────────────────────────────────

def fetch_user_tweets(username: str, dedupe: set, max_retries: int = 3) -> List[Dict]:
    """
    通过 Nitter 公开 RSS 抓取用户最新推文。
    自动轮换实例，失败时重试。
    """
    instances = NITTER_INSTANCES.copy()
    random.shuffle(instances)  # 随机化，分散负载
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=3)
    
    for instance in instances[:max_retries]:
        url = f"{instance}/{username}/rss"
        try:
            feed = feedparser.parse(url, agent="Mozilla/5.0 (compatible; RSS reader)")
            if not feed.entries:
                continue
            
            tweets = []
            for entry in feed.entries:
                # 解析发布时间
                pub = entry.get("published_parsed") or entry.get("updated_parsed")
                if pub:
                    pub_dt = datetime(*pub[:6], tzinfo=timezone.utc)
                    if pub_dt < cutoff:
                        continue
                
                content = entry.get("title") or entry.get("summary") or ""
                # 清理 Nitter 内容 (去掉 RT、@reply 等)
                content = re.sub(r'^RT @\w+:', '', content).strip()
                content = re.sub(r'<[^>]+>', '', content).strip()
                
                if len(content) < 20:  # 跳过太短的内容
                    continue
                
                link = entry.get("link", "")
                # 标准化链接为 x.com 格式
                link = re.sub(r'https?://[^/]+/', 'https://x.com/', link)
                
                fp = get_fingerprint(content)
                
                # 去重检查
                if link in dedupe or fp in dedupe:
                    continue
                
                tweets.append({
                    "author": f"@{username}",
                    "content": content,
                    "link": link,
                    "pubDate": entry.get("published", ""),
                    "fingerprint": fp,
                })
            
            if tweets:  # 成功获取，直接返回
                return tweets
                
        except Exception as e:
            print(f"    ⚠ {instance} 失败: {e}")
            time.sleep(0.5)
            continue
    
    return []

# ─── 分类配置加载 ─────────────────────────────────────────────────────────────

def load_categories() -> Dict[str, Any]:
    """加载分类配置"""
    if not SOURCES_CONFIG.exists():
        print(f"❌ 找不到分类配置: {SOURCES_CONFIG}")
        sys.exit(1)
    return json.loads(SOURCES_CONFIG.read_text(encoding="utf-8"))

# ─── AI 生成 ──────────────────────────────────────────────────────────────────

def call_gemini(prompt: str) -> str:
    """调用 Gemini API"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
    resp.raise_for_status()
    return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

def call_glm(prompt: str) -> str:
    """调用 GLM-4 API"""
    resp = requests.post(
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        headers={"Authorization": f"Bearer {GLM_API_KEY}", "Content-Type": "application/json"},
        json={"model": "glm-4-plus", "messages": [{"role": "user", "content": prompt}], "temperature": 0.7, "max_tokens": 4096},
        timeout=60
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

def call_ai(prompt: str) -> str:
    """优先 Gemini，回退 GLM-4"""
    if GEMINI_API_KEY:
        return call_gemini(prompt)
    elif GLM_API_KEY:
        return call_glm(prompt)
    else:
        raise RuntimeError("未找到 AI API Key（GEMINI_API_KEY 或 GLM_API_KEY）")

# ─── 板块信号生成 ─────────────────────────────────────────────────────────────

def generate_category_signal(category_name: str, description: str, tweets: List[Dict], date_str: str) -> Optional[Dict]:
    """为单个板块生成精选信号 + 摘要 + 行动建议"""
    if not tweets:
        print(f"  📭 [{category_name}] 无内容，跳过")
        return None
    
    tweet_list = "\n---\n".join([
        f"[{i+1}] {t['author']}\n内容: {t['content'][:300]}\n链接: {t['link']}"
        for i, t in enumerate(tweets)
    ])
    
    prompt = f"""你是"Potato"，顶级信息策展人。今天是 {date_str}。

你管理板块「{category_name}」（主题：{description}）。

以下是该板块的最新推文（共 {len(tweets)} 条）：

{tweet_list}

## 任务

1. **精选**：选出最有价值的 5~10 条（若少于5条则全选）
2. **提炼**：每条用一句话（≤60字中文）提炼核心洞见，犀利有力
3. **总结**：写一段板块总结（100-160字），揭示共同趋势
4. **行动**：给出 2~3 条具体可执行建议，以"主权构建者"视角

## 输出格式（严格遵守，只输出格式内容，不要多余文字）

ITEMS_START
序号|账号|信号提炼（一句话）|链接
1|@账号名|信号内容|https://...
ITEMS_END
SUMMARY_START
[板块总结]
SUMMARY_END
ACTIONS_START
- [建议1]
- [建议2]
- [建议3]
ACTIONS_END"""
    
    print(f"  🤖 [{category_name}] 正在生成（{len(tweets)} 条输入）...")
    
    try:
        raw = call_ai(prompt)
        return parse_ai_response(category_name, tweets, raw)
    except Exception as e:
        print(f"  ❌ [{category_name}] AI 生成失败: {e}")
        return None

def parse_ai_response(category_name: str, source_tweets: List[Dict], raw: str) -> Dict:
    """解析 AI 输出"""
    items = []
    
    # 解析 ITEMS
    items_match = re.search(r'ITEMS_START\n(.*?)\nITEMS_END', raw, re.DOTALL)
    if items_match:
        for line in items_match.group(1).strip().split('\n'):
            parts = line.split('|')
            if len(parts) >= 4 and parts[0].strip().isdigit():
                author_handle = parts[1].strip().lstrip('@').lower()
                signal = parts[2].strip()
                link = parts[3].strip()
                
                # 找到对应的原始推文指纹
                source = next(
                    (t for t in source_tweets if 
                     t['author'].lstrip('@').lower() == author_handle or t['link'] == link),
                    None
                )
                fp = source['fingerprint'] if source else get_fingerprint(signal)
                
                items.append({
                    "author": parts[1].strip(),
                    "signal": signal,
                    "link": link,
                    "fingerprint": fp,
                })
    
    # 解析 SUMMARY
    summary_match = re.search(r'SUMMARY_START\n(.*?)\nSUMMARY_END', raw, re.DOTALL)
    summary = summary_match.group(1).strip() if summary_match else "暂无总结。"
    
    # 解析 ACTIONS
    actions_match = re.search(r'ACTIONS_START\n(.*?)\nACTIONS_END', raw, re.DOTALL)
    actions = []
    if actions_match:
        actions = [
            line.lstrip('- ').strip()
            for line in actions_match.group(1).strip().split('\n')
            if line.strip()
        ]
    
    return {
        "category_name": category_name,
        "items": items,
        "summary": summary,
        "actions": actions,
    }

# ─── Markdown 渲染 ────────────────────────────────────────────────────────────

def render_category_section(signal: Dict) -> str:
    rows = "\n".join([
        f"| {i+1} | {item['author']} | {item['signal']} <!--fp:{item['fingerprint']}--> | [→ 原文]({item['link']}) |"
        for i, item in enumerate(signal['items'])
    ])
    action_list = "\n".join([f"- 💡 {a}" for a in signal['actions']])
    
    return f"""## {signal['category_name']}

| # | 来源 | 今日信号 | 链接 |
|---|------|---------|------|
{rows}

> **板块总结** | {signal['summary']}

**⚡ 行动建议**
{action_list}

"""

# ─── 主流程 ───────────────────────────────────────────────────────────────────

def main():
    print("═" * 50)
    print("  🛰  X Signal Categorized Briefing (Python)")
    print("═" * 50)
    
    # 日期设置
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    filename = f"{date_str}-daily-signals.md"
    filepath = POSTS_DIR / filename
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 加载配置和去重
    config = load_categories()
    dedupe = load_existing_dedupe_set()
    
    # 按板块抓取推文
    category_tweets: Dict[str, List[Dict]] = {}
    total_fetched = 0
    
    for cat_name, cat_config in config["categories"].items():
        print(f"\n📡 抓取 [{cat_name}]...")
        cat_tweets = []
        
        for username in cat_config["accounts"]:
            tweets = fetch_user_tweets(username, dedupe)
            if tweets:
                print(f"    ✅ @{username}: {len(tweets)} 条")
                cat_tweets.extend(tweets)
            time.sleep(random.uniform(0.3, 0.8))  # 礼貌延迟，避免触发限流
        
        # 按时间排序，取最新 25 条送 AI
        cat_tweets.sort(key=lambda t: t.get("pubDate", ""), reverse=True)
        category_tweets[cat_name] = cat_tweets[:25]
        total_fetched += len(cat_tweets)
        print(f"  📊 [{cat_name}] 共 {len(cat_tweets)} 条新内容")
    
    print(f"\n📊 总计抓取: {total_fetched} 条新推文")
    
    if total_fetched == 0:
        print("\n⚠️  所有 Nitter 实例均无法访问或无新内容。")
        print("💡 可能原因：")
        print("   1. Nitter 实例被限流，请稍后重试")
        print("   2. 订阅账号近3天无新推文")
        return
    
    # 生成板块信号
    print("\n🤖 开始生成 AI 分析...\n")
    all_signals = []
    selected_fps = set()
    
    for cat_name, tweets in category_tweets.items():
        desc = config["categories"][cat_name]["description"]
        signal = generate_category_signal(cat_name, desc, tweets, date_str)
        if signal and signal["items"]:
            all_signals.append(signal)
            # 更新去重集合（本次运行内也去重）
            for item in signal["items"]:
                selected_fps.add(item["fingerprint"])
                selected_fps.add(item["link"])
                dedupe.add(item["fingerprint"])
                dedupe.add(item["link"])
    
    if not all_signals:
        print("❌ 未能生成任何板块信号，请检查 AI API Key")
        return
    
    # 统计
    total_items = sum(len(s["items"]) for s in all_signals)
    
    # 生成 Markdown
    category_sections = "---\n\n".join([render_category_section(s) for s in all_signals])
    
    full_content = f"""---
title: "X Signal Daily Briefing: {date_str}"
date: "{date_str}"
category: "X Signal"
tags: ["X", "AI", "财富", "营销", "智慧", "日报"]
---

> **Potato's Daily Briefing** · {date_str} · 今日精选 **{total_items}** 条信号，覆盖 **{len(all_signals)}** 个板块

---

{category_sections}---

*Curated by Potato · Powered by Python + Nitter · {now.strftime("%H:%M")}*
"""
    
    # 写入文件
    if filepath.exists():
        # 追加更新
        existing = filepath.read_text(encoding="utf-8")
        update_block = f"\n\n## 🔄 更新 {now.strftime('%H:%M')}\n\n{category_sections}"
        filepath.write_text(existing + update_block, encoding="utf-8")
        print(f"\n✅ 已追加更新到: {filename}")
    else:
        filepath.write_text(full_content, encoding="utf-8")
        print(f"\n✅ 已创建新日报: {filename}")
    
    # 打印统计
    print(f"\n📋 生成统计:")
    for s in all_signals:
        print(f"  {s['category_name']}: {len(s['items'])} 条信号")
    print("═" * 50)
    print(f"  文件路径: {filepath}")
    print("═" * 50 + "\n")


if __name__ == "__main__":
    main()
