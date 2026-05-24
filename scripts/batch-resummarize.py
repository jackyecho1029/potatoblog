#!/usr/bin/env python3
"""Batch re-summarize failed learning posts."""
import json, sys, os, re, subprocess

GEMINI_KEY = "AIzaSyDgEAWdw3lMjz8ejK_oD4TojUYLO8tOgFw"
HTTPS_PROXY = "http://127.0.0.1:7897"
POSTS_DIR = "/Users/jackypotato/potatoblog/posts/learning"

SUMMARY_PROMPT = """你是一位资深的商业分析和内容提炼专家。请为以下 YouTube 视频的转录文稿生成一份高质量的中文摘要。

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
{transcript}"""

LENNY_PROMPT = """你是一位顶级商业分析师和"一人公司"实战专家，深度推崇查理·芒格的多元思维模型和金字塔原理。
请深度剖析 Lenny's Podcast 的访谈文稿（受访者：{guest}）。

### 要求：
1. **语言**：必须使用**简体中文**。
2. **核心原则**：
   - **金字塔原理**：结论先行，逻辑推进，案例支撑。
   - **查理·芒格思维**：挖掘其背后的思维模型（如反向思维、格栅效应、激励机制等）。
   - **AI/提效赋能**：聚焦 AI 前沿科技如何赋能生活、个人效率或**电商业务**。
   - **认知重构**：重点对比"旧时代观念" vs "AI 时代新现实"。

### 输出格式：

# 🎯 核心结论

[用一段话总结该嘉宾最核心、最具颠覆性的观点]

---

# 🏛️ 核心分析（金字塔原理）

## 1. [核心逻辑 A]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

## 2. [核心逻辑 B]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

## 3. [核心逻辑 C]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

---

# 🧠 芒格格栅：思维模型拆解

- **[模型 1]**：[描述受访者如何应用该思维模型，以及它如何提升了认知水平]
- **[模型 2]**：[描述受访者如何应用该思维模型，以及它如何提升了认知水平]

---

# ⚡ AI 时代的赋能与重塑

- **前沿应用**：[文稿中提到的具体 AI 技术或趋势]
- **商务/电商实战建议**：[如何直接应用到电商运营或个人提效中]
- **观念打破 (Old vs New)**：
    *   **旧观念**：[描述具体的旧观点]
    *   **新现实**：[描述 AI 时代带来的重塑性变化]

---

# 💡 行动建议 (Steve Jobs 风格)

1. **[行动1]**：[简洁有力的建议]
2. **[行动2]**：[简洁有力的建议]
3. **[行动3]**：[简洁有力的建议]

---
转录文稿内容：
{transcript}"""

# Video list: (video_id, author)
VIDEOS = [
    ("gaKQa9TuSmQ", "Mel Robbins"),
    ("pHxhceutGZg", "Mel Robbins"),
    ("OV5eK91YY68", "Greg Isenberg"),
    ("DIa0MYJzM5I", "Lenny's Podcast"),
    ("wc8FBhQtdsA", "Lenny's Podcast"),
    ("k-H4nsOTuxU", "Lenny's Podcast"),
]

def fetch_transcript(video_id):
    """Fetch transcript via Innertube API using curl."""
    video_url = f"https://www.youtube.com/watch?v={video_id}"

    # Get API key from page
    result = subprocess.run(
        ["curl", "-s", video_url, "--proxy", HTTPS_PROXY, "--connect-timeout", "15"],
        capture_output=True, text=True, timeout=30
    )
    match = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', result.stdout)
    if not match:
        return None
    api_key = match.group(1)

    # Call player API
    payload = json.dumps({
        "context": {"client": {"clientName": "ANDROID", "clientVersion": "20.10.38"}},
        "videoId": video_id
    })
    result = subprocess.run(
        ["curl", "-s", f"https://www.youtube.com/youtubei/v1/player?key={api_key}",
         "-H", "Content-Type: application/json", "-d", payload,
         "--proxy", HTTPS_PROXY, "--connect-timeout", "15"],
        capture_output=True, text=True, timeout=30
    )
    clean = re.sub(r'[\x00-\x1f\x7f]', ' ', result.stdout)
    data = json.loads(clean)
    tracks = data.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
    if not tracks:
        return None

    track = next((t for t in tracks if t['languageCode'] == 'en'), tracks[0])
    caption_url = track['baseUrl']

    # Fetch caption XML
    result = subprocess.run(
        ["curl", "-s", caption_url, "--proxy", HTTPS_PROXY, "--connect-timeout", "15"],
        capture_output=True, text=True, timeout=30
    )
    xml = result.stdout

    # Parse <p><s> format
    entries = []
    for p in re.finditer(r'<p\s[^>]*?t="(\d+)"[^>]*>(.*?)</p>', xml):
        offset_ms = int(p.group(1))
        words = re.findall(r'<s[^>]*>([^<]*)</s>', p.group(2))
        text = ' '.join(words).strip()
        if text:
            minutes = offset_ms // 60000
            seconds = (offset_ms % 60000) // 1000
            entries.append(f'[{minutes:02d}:{seconds:02d}] {text}')

    if not entries:
        return None
    return ' '.join(entries)


def summarize_with_gemini(author, transcript_text):
    """Call Gemini API for summarization."""
    if 'Lenny' in author:
        prompt = LENNY_PROMPT.format(guest=author, transcript=transcript_text[:30000])
    else:
        prompt = SUMMARY_PROMPT.format(transcript=transcript_text[:25000])

    payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]})

    result = subprocess.run(
        ["curl", "-s",
         f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={GEMINI_KEY}",
         "-H", "Content-Type: application/json", "-d", payload,
         "--proxy", HTTPS_PROXY],
        capture_output=True, text=True, timeout=120
    )

    data = json.loads(result.stdout)
    text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
    if not text:
        print(f"  Gemini error: {json.dumps(data)[:200]}", file=sys.stderr)
        return None
    return text


def find_post_file(video_id):
    """Find the markdown file for a given video ID."""
    for f in os.listdir(POSTS_DIR):
        if not f.endswith('.md'):
            continue
        filepath = os.path.join(POSTS_DIR, f)
        with open(filepath) as fh:
            content = fh.read()
        if video_id in content:
            return filepath
    return None


def update_post(filepath, summary):
    """Update the markdown file with new summary, preserving frontmatter."""
    with open(filepath) as f:
        content = f.read()

    # Find end of frontmatter
    parts = content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = parts[1]
        new_content = f'---{frontmatter}---\n\n{summary}\n\n---\n*由 PotatoLearning Hub 自动生成*\n'
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False


def main():
    success = 0
    failed = 0

    for i, (video_id, author) in enumerate(VIDEOS):
        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(VIDEOS)}] Processing {video_id} ({author})")

        # Find existing post
        filepath = find_post_file(video_id)
        if not filepath:
            print(f"  SKIP: no post file found")
            failed += 1
            continue

        print(f"  File: {os.path.basename(filepath)}")

        # Fetch transcript
        print(f"  Fetching transcript...")
        transcript = fetch_transcript(video_id)
        if not transcript:
            print(f"  FAILED: no transcript available")
            failed += 1
            continue
        print(f"  Transcript: {len(transcript)} chars")

        # Summarize
        print(f"  Summarizing with Gemini...")
        summary = summarize_with_gemini(author, transcript)
        if not summary:
            print(f"  FAILED: Gemini error")
            failed += 1
            continue
        print(f"  Summary: {len(summary)} chars")

        # Update post
        if update_post(filepath, summary):
            print(f"  SUCCESS: updated {os.path.basename(filepath)}")
            success += 1
        else:
            print(f"  FAILED: could not update file")
            failed += 1

    print(f"\n{'='*60}")
    print(f"DONE: {success} success, {failed} failed out of {len(VIDEOS)}")


if __name__ == '__main__':
    main()
