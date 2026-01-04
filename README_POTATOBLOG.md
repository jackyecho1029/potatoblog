# PotatoEcho Blog - Quick Start Guide

Welcome to your new digital garden! 🌱

## 🚀 How to Run Locally

1.  Open Terminal in this folder (`d:\Antigravity\Jackypotato\potatoblog`).
2.  Run `npm run dev`.
3.  Open browser at `http://localhost:3000`.

## ✍️ How to Write a New Post

1.  Go to the `posts/` folder.
2.  Create a new file, e.g., `my-second-post.md`.
3.  Copy the header format:

```markdown
---
title: "Title of Your Post"
date: "2026-01-05"
tags: ["Growth", "Tech"]
---

Start writing your content here...
```

The system will **automatically** detect it and add it to the homepage!

## 💬 How to Setup Comments (Giscus)

To make comments work, you need to connect your GitHub repo:

1.  Go to [giscus.app](https://giscus.app).
2.  Type your repo: `jackyecho1029/potatoblog`.
3.  **Enable Discussions** in your GitHub repo settings first!
4.  Giscus will give you a **Repo ID** and **Category ID**.
5.  Open `app/components/GiscusComments.tsx` and paste those IDs.

Happy writing! 🥔
