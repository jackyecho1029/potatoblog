#!/usr/bin/env python3
"""Backfill `game_title` (fun Simplified Chinese level name) into existing X signal posts.

Uses GLM via the Anthropic-compatible gateway. Key comes from GLM_API_KEY or ZHIPU_API_KEY.
Reuses the prompt and cleaner from fetch-x-signals.py so old and new days read the same.

    python3 scripts/backfill-x-signal-titles.py            # all files missing game_title
    python3 scripts/backfill-x-signal-titles.py --limit 3  # try a few first
"""
import importlib.util
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "posts" / "x-signals"
KEY = os.environ.get("GLM_API_KEY") or os.environ.get("ZHIPU_API_KEY", "")
MODEL = os.environ.get("GLM_MODEL", "glm-5.3-flash")
URL = "https://open.bigmodel.cn/api/anthropic/v1/messages"

spec = importlib.util.spec_from_file_location("fx", ROOT / "scripts" / "fetch-x-signals.py")
fx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fx)


def digest_of(body: str) -> str:
    """Plain-ish text of the day's signals: drop links, html comments, table pipes and markup."""
    text = re.sub(r"<!--.*?-->", "", body)
    text = re.sub(r"\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"[|#>*_`]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()[:2500]


def ask(digest: str) -> str:
    r = requests.post(
        URL,
        headers={"Authorization": f"Bearer {KEY}", "anthropic-version": "2023-06-01", "content-type": "application/json"},
        json={"model": MODEL, "max_tokens": 200, "thinking": {"type": "disabled"},
              "messages": [{"role": "user", "content": fx.GAME_TITLE_PROMPT.format(digest=digest)}]},
        timeout=90,
    )
    r.raise_for_status()
    return "".join(b.get("text", "") for b in r.json().get("content", []) if b.get("type") == "text")


def process(path: Path) -> str:
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m or re.search(r"^game_title:", m.group(1), re.M):
        return f"skip {path.name}"
    title, err = "", None
    # Retry with a shorter digest each time: handles transient overloads and the gateway's
    # content filter (code 1301), which usually trips on something deep in a long digest.
    for size in (2500, 900, 400):
        try:
            title = fx.clean_game_title(ask(digest_of(m.group(2))[:size]))
            if title:
                break
        except Exception as e:
            err = e
    if not title:
        return f"FAIL {path.name} {err}"
    fm = m.group(1)
    line = f"game_title: {json.dumps(title, ensure_ascii=False)}"
    fm = re.sub(r"^(title:.*)$", lambda t: t.group(1) + "\n" + line, fm, count=1, flags=re.M) if re.search(r"^title:", fm, re.M) else line + "\n" + fm
    path.write_text(f"---\n{fm}\n---\n{m.group(2)}", encoding="utf-8")
    return f"ok   {path.name} {title}"


def main():
    if not KEY:
        sys.exit("GLM_API_KEY / ZHIPU_API_KEY 未设置")
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    files = sorted(POSTS.glob("*.md"), reverse=True)[:limit]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for line in pool.map(process, files):
            print(line, flush=True)


if __name__ == "__main__":
    main()
