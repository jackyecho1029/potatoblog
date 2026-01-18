---
title: "一人公司实战：从零手搓「Reddit 市场雷达」 (无需 API Key)"
date: "2026-01-19 14:30:00"
categories: [AI Tools, Solopreneur]
tags: [Python, Reddit, Gemini, Growth Hacking]
---

作为一名"一人公司" (Solopreneur)，市场调研是我们的生命线。我们需要知道用户在问什么，痛点在哪里。

今天我遇到了一个典型难题：我想做一个工具来挖掘 Reddit 上的真实用户提问，但是 Reddit 的 API 申请变得异常困难，或者需要漫长的等待。

难道没有 API Key 就不能做市场调研了吗？

**当然不。**

今天分享我是如何用 Python + Gemini，在没有 API Key 的情况下，"手搓"出一个 **Keyless Reddit Research Agent**。

## 🛠️ 核心思路：另辟蹊径

通常的思路是：`申请 API` -> `获取 Token` -> `调用接口`。
但在"一人公司"的实战中，**效率至上**。

我发现 Reddit 其实为每个页面都提供了公开的 JSON 数据源。只要你在 URL 后面加个 `.json`，就能看到结构化的数据。

比如：`https://www.reddit.com/r/Pottery/search.json?q=glaze&sort=relevance`

利用这一点，我们可以绕过繁琐的 OAuth 认证，直接获取公开数据。

## 💡 功能设计：也不仅仅是爬虫

光抓取数据没有意义，数据的价值在于**洞察**。

我设计了这个工具的三个核心步骤：

1.  **真实挖掘 (Mining)**：
    *   去特定的 Subreddit (如 r/Pottery) 搜索关键词。
    *   提取出带有 `?` 或 `How/Why` 开头的真实用户提问。
    *   *特别是抓取"点赞数"和"评论数"，这代表了痛点的真实热度。*

2.  **AI 裂变 (Expansion)**：
    *   把这些真实问题投喂给 **Gemini 3 Flash**。
    *   让 AI 扮演"搜索意图专家"，把一个问题裂变成 5 个搜索查询（Transactional, Informational 等）。

3.  **智能评分 (Scoring)**：
    *   最重要的一步！我结合了 Reddit 的原始热度 + AI 对潜在需求的判断，给每个查询打分 (1-10)。
    *   生成一份 Excel 表格，按分数排序。

## 🚀 实战效果

我以 "Glaze Crawling" (釉面缩釉，陶瓷圈的一个常见痛点) 为例跑了一遍：

1.  工具不需要我输入任何密码，直接开始扫描 `r/Pottery`。
2.  它找到了几个高赞问题，其中一个有 183 个点赞，关于"Underglaze crawling"。
3.  Gemini 迅速将其裂变，并指出："How to fix underglaze crawling" 是一个 9 分的高价值选题。
4.  最终生成了一个 Excel，我只需要盯着最上面的几行，就知道下篇博客该写什么了。

## 📦 开源分享

我把这个工具的核心逻辑封装成了一个 Python 脚本。如果你也想搭建自己的"市场雷达"，核心代码大概是这样的：

```python
# 伪代码示例：Keyless Mining
url = f"https://www.reddit.com/r/{subreddit}/search.json?q={keyword}&restrict_sr=1"
headers = {'User-Agent': 'Mozilla/5.0...'} # 模拟浏览器很重要
response = requests.get(url, headers=headers)
data = response.json()
# ...提取 data['data']['title'] 和 data['data']['score']
```


## 🤝 进阶玩法：指南针与铁锹 (Hybrid Strategy)

在拥有了这个工具后，我发现它和一个叫 **WordCrafter (Reddit Intelligence)** 的工具简直是绝配。

我总结了一套 **"指南针 + 铁锹"** 的一人公司工作流：

### 1. 指南针 (The Compass) 🧭
先用 WordCrafter 看宏观趋势。
*   **动作**：打开 Dashboard，看 "Pain Points" 面板。
*   **发现**：比如我看到 *"Community Studio Frustrations"* (共享工作室的挫折) 正在成为热门痛点。
*   **作用**：它告诉我 **"去哪里挖"**。

### 2. 铁锹 (The Shovel) ⛏️
再用我们手搓的 Local Agent 进行微观挖掘。
*   **动作**：运行 `python synthetic_query_generator.py "Community Studio Frustrations" --source reddit`
*   **挖掘**：它迅速挖出了真实用户的具体抱怨："工作室太脏"、"架子被占"、"作品被摔碎"。
*   **作用**：它帮我 **"挖出金矿"**。

### 3. 结果 (The Gold) 💰
最后，我根据 Excel 里的高分选题，写了一篇《如何在家搭建迷你陶艺工作室：告别共享工作室的噩梦》。
*   **结果**：文章发布后，精准击中用户痛点，转化率极高。

## 🤔 思考：工具即杠杆

对于一人公司来说，在这个 AI 时代，**不仅要会用工具，还要有能力"手搓"工具**。

当现成的路（API）堵死的时候，稍微懂一点代码逻辑，就能帮你凿开一个新的入口。这可能就是技术赋予我们的最大自由。

---

*如果你对这个工具感兴趣，或者也想搭建自己的一人公司自动化系统，欢迎关注我的后续分享。*
