#!/usr/bin/env python3
"""Process a single YouTube video: fetch transcript, summarize, write post."""
import json, subprocess, re, os

# Read from .env.local instead of hardcoding
def _load_env():
    env = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    return env

_env = _load_env()
GEMINI_KEY = os.environ.get('GEMINI_API_KEY') or _env.get('GEMINI_API_KEY', '')
PROXY = os.environ.get('https_proxy') or os.environ.get('http_proxy') or 'http://127.0.0.1:1082'
KEY = os.environ.get('YOUTUBE_API_KEY') or _env.get('YOUTUBE_API_KEY', '')
POSTS_DIR = "/Users/jackypotato/potatoblog/posts/learning"

def yq(s):
    """YAML-safe scalar: wrap in single quotes, escape internal single quotes by doubling.
    Single-quoted YAML treats every other char (including " and \\) as literal,
    so titles with quotes no longer break frontmatter parsing."""
    return "'" + str(s).replace("'", "''") + "'"

def curl(url, payload=None):
    cmd = ["curl", "-s", url, "--proxy", PROXY, "--connect-timeout", "15"]
    if payload:
        cmd += ["-H", "Content-Type: application/json", "-d", payload]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return r.stdout

def _extract_tracks(player_json):
    return player_json.get('captions',{}).get('playerCaptionsTracklistRenderer',{}).get('captionTracks',[])

def _parse_xml(xml):
    entries = []
    for p in re.finditer(r'<p\s[^>]*?t="(\d+)"[^>]*>(.*?)</p>', xml):
        words = re.findall(r'<s[^>]*>([^<]*)</s>', p.group(2))
        text = ' '.join(words).strip()
        if text:
            ms = int(p.group(1))
            entries.append(f'[{ms//60000:02d}:{(ms%60000)//1000:02d}] {text}')
    return ' '.join(entries) if entries else None

CLIENTS = [
    {"clientName":"ANDROID","clientVersion":"20.10.38"},
    {"clientName":"WEB","clientVersion":"2.20240101.00.00"},
    {"clientName":"MWEB","clientVersion":"2.20240101.08.00"},
]

def fetch_transcript(vid):
    html = curl(f"https://www.youtube.com/watch?v={vid}")
    m = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
    if not m: return None
    api_key = m.group(1)
    for client in CLIENTS:
        payload = json.dumps({"context":{"client":client},"videoId":vid})
        player = curl(f"https://www.youtube.com/youtubei/v1/player?key={api_key}", payload)
        clean = re.sub(r'[\x00-\x1f\x7f]',' ', player)
        d = json.loads(clean)
        tracks = _extract_tracks(d)
        if not tracks: continue
        track = next((t for t in tracks if t['languageCode']=='en'), tracks[0])
        xml = curl(track['baseUrl'])
        result = _parse_xml(xml)
        if result: return result
    return None

def summarize(transcript):
    prompt = f"""你是一位资深的商业分析和内容提炼专家。请为以下 YouTube 视频的转录文稿生成一份高质量的中文摘要。

### 要求：
1. **语言**：必须使用**简体中文**。
2. **标题**：生成一个有吸引力的中文标题（hook title），要能引起读者好奇心。
3. **分类**：从以下选择最合适的一个：AI构建者、产品与战略、增长与分发、领导力与文化、创业与融资、设计与体验、思维成长、健康生活。

### 输出格式（严格按此格式，不要加任何前缀）：

## 🎯 核心观点

[用2-3句话概括视频最核心的观点]

---

## 📌 关键要点

### 1. [要点标题]
- **核心内容**：[详细说明]
- **实战建议**：[可操作的行动建议]

### 2. [要点标题]
- **核心内容**：[详细说明]
- **实战建议**：[可操作的行动建议]

### 3. [要点标题]
- **核心内容**：[详细说明]
- **实战建议**：[可操作的行动建议]

---

## 💡 金句摘录

> "[最有启发的一句话]"

---

## 🔑 行动清单

1. [具体可执行的行动1]
2. [具体可执行的行动2]
3. [具体可执行的行动3]

---
转录文稿内容：
{transcript[:25000]}"""

    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]})
    result = subprocess.run(
        ["curl", "-s", f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={GEMINI_KEY}",
         "-H", "Content-Type: application/json", "-d", payload, "--proxy", PROXY],
        capture_output=True, text=True, timeout=120
    )
    data = json.loads(result.stdout)
    return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')

# --- Main ---
vid = os.sys.argv[1] if len(os.sys.argv) > 1 else "vZLY2YGUk4o"
print(f"Processing: {vid}")

# Get video info
info = json.loads(curl(f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={vid}&key={KEY}"))
item = info['items'][0]
title = item['snippet']['title']
channel = item['snippet']['channelTitle']
date = item['snippet']['publishedAt'][:10]
print(f"Title: {title}")
print(f"Channel: {channel}")
print(f"Date: {date}")

# Fetch transcript
print("Fetching transcript...")
transcript = fetch_transcript(vid)
if not transcript:
    print("ERROR: No transcript available")
    os.sys.exit(1)
print(f"Transcript: {len(transcript)} chars")

# Summarize
print("Summarizing with Gemini...")
summary = summarize(transcript)
if not summary:
    print("ERROR: Gemini failed")
    os.sys.exit(1)
print(f"Summary: {len(summary)} chars")

# Write post
slug = date + "-" + title.lower().replace(' ','-').replace(':','').replace("'","").replace('"','').replace('?','').replace('!','').replace(',','').replace('|','').replace('&','and')[:80]
slug = re.sub(r'[^a-z0-9-]', '', slug).strip('-')
filepath = os.path.join(POSTS_DIR, f"{slug}.md")

frontmatter = f'''---
title: {yq(title)}
original_title: {yq(title)}
author: {yq(channel)}
category: "AI构建者"
date: "{date}"
tags: ["AI构建者", {yq(channel)}]
source_url: "https://www.youtube.com/watch?v={vid}"
thumbnail: "https://img.youtube.com/vi/{vid}/maxresdefault.jpg"
---

{summary}

---
*由 PotatoLearning Hub 自动生成*
'''

with open(filepath, 'w') as f:
    f.write(frontmatter)
print(f"SUCCESS: {filepath}")
