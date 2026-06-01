---
title: "Vibe Code Camp 深度拆解：17位顶级 AI 构建者的思维、方法与趋势预判"
original_title: "Vibe Code Camp: Live Marathon With the World's Best AI Builders"
author: "Every"
category: "AI构建者"
date: "2026-01-22"
tags: ["AI构建者", "Every", "Vibe Coding", "AI趋势", "深度分析"]
source_url: "https://www.youtube.com/watch?v=5YBjll9XJlw"
thumbnail: "https://img.youtube.com/vi/5YBjll9XJlw/maxresdefault.jpg"
---

> **编者按**：2026年1月22日，Every 举办了一场长达8小时的直播马拉松——**Vibe Code Camp**。这不是一场普通的直播。17位站在 AI 构建最前沿的人——从 Anthropic 的 Claude Code 内部成员，到 Google AI Studio 负责人，从 solo 开发者到顶级 VC——在一天之内展示了他们如何用 AI 构建产品。本文不是摘要，而是一篇**深度编辑分析**，试图从这群人的行为、方法和观点中，提取出关于 AI 未来的真实信号。

---

## 一、这不是一场黑客松，这是一次集体宣言

先说清楚一件事：**Vibe Code Camp 的参与者不是在"展示 AI 有多酷"。**

他们在展示的是：**AI 已经从根本上改变了"构建"这件事本身的定义。**

17位讲者跨越了极为广泛的光谱：

| 类型 | 代表人物 |
|------|----------|
| 完全不懂代码的 CEO | Dan Shipper (Every)、Ben Tossel (Ben's Bites) |
| 技术背景的创始人 | Ash McGallis (Hearth)、Ryan Carson (Untangle) |
| 投资/战略视角 | Tina He (Pace Capital)、Kevin Rose (True Ventures) |
| 大厂产品负责人 | Logan & Amar (Google AI Studio)、Tariq (Anthropic) |
| 平台生态构建者 | Jeffrey Litt (Notion) |
| 企业级实战者 | Paula (Portola)、Natalia & Nitesh (Every 顾问) |
| Solo 产品经理 | Naveen (Monologue)、Yash (Sparkle) |
| 跨领域创新者 | Brooker Belcourt (AI + 金融分析) |

这个阵容本身就透露了一个信号：**AI 构建不再是程序员的专属领地。它正在成为每个角色的核心能力。**

---

## 二、五大核心趋势

### 趋势一：从"写代码"到"传达意图"——编程语言的终结

这是整场活动中最反复出现的主题。

**Dan Shipper** 在开场就直说了：

> "I have absolutely no idea how any of the code works. We're living in crazy times."

他两周内、利用会议间隙，构建了一个完整的 agent-native Markdown 编辑器 **Proof**——具备人类/AI 共同编辑、来源追踪、风格检查代理等功能。这本应是一个3人工程团队6个月的项目。

**Ben Tossel** 更极端。三个三岁以下的孩子的父亲，完全不懂代码，却：

- 用一个 766 条消息的会话，从零重建了整个 Bubble 平台上的广告预订系统
- 在上台前 10 分钟，一句话让 agent 帮他加了一个退出弹窗
- 正在为 Factory（Droid）push 实际的生产代码

他的学习方法值得注意：**不是学语法，而是在与 agent 的对话中自然习得概念**。

> "You just start recognizing the patterns and feeling more confident with what you're doing. Like, 'Glob, what the f**k is glob?' Oh, it's a search tool."

**Tina He** 从投资人视角给了这个趋势一个优雅的框架：

> "This is a renaissance of wordcel's power. If you're able to describe something, you can really will it into existence."

**关键洞察**：编程语言正在从"人与机器的接口"退化为"机器内部的实现细节"。真正的编程语言变成了**自然语言**。这不是比喻——当 Linus Torvalds 都通过 Claude 提交代码时，正如 Kevin Rose 所说：

> "It's safe to say this is kind of coding now."

### 趋势二：多代理协作架构——从工具到团队

如果说2025年是"单代理年"，2026年正在成为"多代理编排年"。

**Nat Eliason** 的架构可能是全场最精密的：

- **Opus 4.5** 担任"工程经理"——负责规划、审核、决策
- **Codex 5.2** 担任"实现者"——负责写代码
- **ClaudeBot** 是他办公室里 24/7 运行的 Mac mini 上的 Claude Code 实例
  - 通过 Telegram 接收指令（包括语音）
  - 每天凌晨2点自动分析用户对话日志，写报告
  - 自动修复 Sentry 报告的 bug
  - 夜间运行完整的端到端测试套件
  - 递归式 PR 自动化：Claude 审核自己的 PR review，分类问题，自动修复，循环运行

> "I trust Opus to be my engineering manager and to control all of my Codex instances to write the code."

**Ryan Carson** 的 **Compound Product** 管道更加系统化：

1. **Phase Zero**（午夜 cron）：拉取 Postgres 数据，让 Opus 写"VP of Product / VP of Engineering / VP of Sales"级别的洞察报告
2. **Phase One**：分析报告，生成优先级排序的建议
3. **Phase Two**：生成 PRD（产品需求文档），拆分为原子级用户故事
4. **Phase Three**：验证每个任务的验收标准可以被 agent 自主验证
5. **Phase Four（Ralph Loop）**：循环执行——实现、质量检查、修复、提交、更新

他还引入了**三层记忆架构**：
- **长期记忆**：训练进模型的 system prompt / skill
- **中期记忆**：`agents.md` 文件——每个工程师都需要知道的仓库级知识
- **短期记忆**：`progress.txt`——当前循环中发现的坑，下次循环不用重学

> "All we as humans are, are loops. You wake up, you read your email, you look at your data, you decide what to do, you implement it, and you go to sleep. This is what our armies of agents should be doing."

**Jeffrey Litt** 从 Notion 的角度展示了另一种编排：把 Notion 作为 Claude Code 的看板。Agent 可以在 Notion 卡片上更新状态、请求人类输入（卡片变红），人类在评论中回复后 agent 自动继续。

**关键洞察**：多代理架构不是"用更多 AI"，而是**建立组织结构**——分配角色、设置记忆、建立反馈循环。这本质上是在构建一个 AI 员工团队，需要的管理思维与传统团队管理惊人地相似。

### 趋势三：一人公司的崛起——不是比喻，是事实

**Naveen** 一个人在构建 **Monologue**（语音转文字 app），直接竞争的对象是已经融资 1000万到8000万美元的 VC 支持的公司。Every 本身只融了不到70万美元。

但 Naveen 的态度出人意料地平静：

> "I'm actually thankful for well-funded competitors that seed the market."

他的逻辑是：竞争对手花几百万教育市场，而他做出"一样好甚至更好"的产品。

**Dan Shipper** 提到 Every 的内部运营：

> "One GM can maintain a product that could challenge a company with 30-50 people."

**Kevin Rose** 引用 Shopify 的 Tobi 的话：

> "The ideal team now is like a team of one."

**Paula** 在 Portola 的实战更加具体：设计师——从没写过代码的人——正在直接提交 iOS PR。她审查后合并，但 PR 基本上可以直接发布。

> "Your non-engineers can ship code and your users won't know the difference."

**关键洞察**：一人公司不是"更辛苦"，而是"不同的杠杆"。传统杠杆是招聘和管理；新杠杆是 agent 编排和 taste。拥有 taste 的人正在获得前所未有的构建能力。

### 趋势四：质量飞跃——"Slop 时代"正在结束

这是一个重要的信号变化。

**Google AI Studio 的 Amar** 直言：

> "The slop era is honestly behind us. If you have taste, you can go and make the thing."

**Kevin Rose** 用数据说话：在采用 Compound Engineering 工作流（plan → work → review → compound → repeat）后：

> "My code quality went from like 80% to like 97%."

他的方法值得详细描述：
- 在 Cursor 里开两个侧栏：一个用 Opus 4.5 写代码，一个用 GPT-5 审代码
- 让 GPT-5 充当"代码审查的朋友"
- 把 GPT-5 的反馈转述给 Opus，要求它解释为什么它的设计决策更好
- 这套手动多模型流程将质量从 80% 推到 90%
- 采用 Compound Engineering 插件后直接到 97%

**Paula** 展示了一个让人震惊的例子：Claude 用5分钟、一条开放的 prompt，做出了一个 SpriteKit 动画（金币飞过屏幕庆祝 token 赠送），效果**比 Figma 里的设计稿还好**——因为 Claude 理解了物理动画，甚至加了设计师都没想过的金币旋转效果。

> "It did a better job than what was even prototyped in the Figma file."

**关键洞察**：质量问题已经从"AI 生成的代码能不能用"进化到"AI 生成的代码是否比人类写的更好"。答案在特定场景下已经是肯定的。但前提是：**你必须有 taste，并且知道如何引导 AI。**

### 趋势五：从终端到 GUI 的"速成轮回"

**Nat Eliason** 在活动中提出了一个引发广泛讨论的观点：

> "Command lines are dead and we're back to GUIs."
> "We're almost like speed-running the DOS era, and instead of it taking like 15 years to get to GUIs, it's just we had DOS for 2 months and now we're into GUIs."

他认为终端界面已经是"两个月前的石器时代"，像 **Conductor** 这样的 GUI 工具在管理多项目、git worktree、PR 和开发服务器方面严格优于终端。

**Tariq**（Anthropic）承认 Claude Code 确实创造了一波"回归终端"的运动，但 Anthropic 内部也在探索多种 UI——Claude Code Remote、Web 版、Desktop 版、CoWork 等。他把终端界面的"键盘优先、简洁、响应快"称为"需要超越的高水位线"。

**Jeffrey Litt** 引用了一句精彩的话：

> "A CLI is a mediocre GUI and a mediocre API, but the fact that it's both is what's great."

**关键洞察**：CLI vs GUI 不是非此即彼的问题。CLI 赢在可组合性和 agent 可访问性——这恰恰是 agent-native 的关键。但 GUI 正在快速进化，未来的答案很可能是**兼具两者优势的新形态**。

---

## 三、方法论解析：这些人是怎么干的？

### 1. "实习生"隐喻（Paula）

> "We've been treating Claude as an intern that just learns very quickly. And once it knows these things, it can implement things faster than any of us could."

Paula 的团队有完整的 Claude 入职流程：
- **13个 Skills**（Markdown 文件）——编码了"你会在新员工第一周告诉他们的所有事"
- **Hooks**——自动化的护栏脚本，防止 Claude 重复犯同样的错
- **MCP 集成**——GitHub、Linear、Sentry、PostHog、DataDog、Figma，全部在一个对话中可用

### 2. 反向工程学习法（Ben Tossel & Yash）

Ben 的"cookbook"网站和 Yash 的反向工程方法异曲同工：

Yash 的四步法：
1. 找到方法论文章（如 Kevin Shen 的 Rewind app 逆向文）
2. 把目标 app 放在 Mac 上
3. 让 LLM 生成全面的分析报告，保存为 .md
4. 反复重复

> "Every app on your Mac is a 'book' you can read."

他的哲学是：Stack Overflow 上的建议只是"opinions"——没有经过规模验证。而反向工程十亿美元级 app，你学到的是**已经被规模验证过的框架和方案**。

### 3. Compound Engineering 循环（Kieran Classon + Kevin Rose）

Plan → Work → Review → **Compound** → Repeat

关键在于 **Compound** 这一步——大多数人跳过的步骤。当 AI 犯错或做出你不喜欢的决策时，运行 `/workflows compound`：
- 系统提取教训，创建带关键词的文档
- 后续的 plan 和 review 阶段，"最佳实践 agent"自动注入相关文档到上下文窗口
- 这就像给 AI 建一个**个人化的最佳实践知识库**

### 4. 自主循环（Ryan Carson）

Ryan 的"Compound Product"管道追求的是：

> "I shouldn't have to wake up and decide what got built overnight. I should wake up to a PR. And then eventually I should wake up to a shipped PR."

整个管道从数据拉取 → 分析 → PRD → 任务拆分 → 执行 → 测试 → 提交 PR，全部自动化。他可以同时 spawn 多个实例。

### 5. Quiz 实践法（Jeffrey Litt）

这是全场最具独创性的方法论：

> "At work, if I'm sending PRs to people that an agent wrote, I will refuse to send it unless I can pass a quiz of understanding what's in the PR."

他让 AI 先从宏观角度解释代码的原理（如月球着陆器的物理），然后生成测验。这是对 AI 辅助编码中 Dunning-Kruger 效应的防御——**很容易说服自己理解了某件事，即使你并没有。**

---

## 四、来自内部的视角：Anthropic 和 Google 怎么看？

### Anthropic — "Unhobbling the Model"

**Tariq** 透露了 Anthropic 内部的一个核心概念：**Unhobbling**（解除束缚）。

模型有内在的能力和知识，但产品层可能没有正确地提取它们。Claude Code 团队的核心任务是：**给模型"更多的空间"，让它充分表达它已经知道如何做的事。**

这要求一个激进的实践：**每3个月删除和重新架构代码**。

> "Most people get stuck at deleting the code. They don't want to throw out what they built because they don't believe the model is good enough yet."

他引用了 **Jevons 悖论**：因为 Claude 可以写10倍的代码，所以你也可以删除10倍的代码。

另一个重要预告：**Tasks 将取代 To-Dos**。新系统支持依赖图、跨会话持久化、多 agent 共享——这本质上是在给 agent 建一个真正的项目管理基础设施。

关于护城河，他有一句精妙的话：

> "They can copy a point, but they can't copy the vector."

竞争对手可以复制某个功能点，但无法复制产品的方向和轨迹。而且，**被扔掉的代码中也包含了大量学习**——克隆者看不到这些。

### Google AI Studio — "Slop Era Is Behind Us"

**Amar** 和 **Logan** 带来了 Google 内部的视角：

- **双位数百分比的 Google 员工**已经在用 AI Studio 加速产品开发
- AI Studio 的定位是**首次 vibe coder**，对手是 Bolt/Lovable，不是 Cursor/Claude Code
- 正在构建一键迁移到 Google 的全功能 IDE **Antigravity** 的通道

**Amar** 认为关键的跨越点是 **tool calling**：

> "Tool calling is the 'fruits that bears all the gifts' — the ability for models to make micro-decisions during long-running tasks."

**Logan** 对 "slop" 的定义很有启发性：

> "Slop is anything that is most in distribution for the model. It's the default behavior, the easiest thing to make the model do."

他的建议：**推到模型"勉强能做"的边缘**。但他预测这是暂时的——12个月后，模型的"分布中心"会移动，高质量输出将成为默认。

---

## 五、潜在问题与隐忧

这场活动不是一味乐观的推销。多位讲者不约而同地指出了真实的问题。

### 1. "Pain Threshold"——痛苦阈值是你的天花板

**Ben Tossel** 的这个概念可能是整场活动中最诚实的：

> "Everyone gets there where you like fix it, fix it, fix it. And you're sort of in that loop and you're like, 'Why the f**k is it this agent? It's so smart that it can't fix this thing that's a bug that seems like an obvious thing.'"

他承认：问题永远出在自己身上。

> "It's always a me problem. And I know that because I can't code. So my job is to figure out what am I doing wrong that's causing this."

这是一个更深层的真相：**vibe coding 的瓶颈不是 AI 的能力，而是人类表达意图的精度。**

### 2. "TikTokification of Code"——代码的短视频化

**Yash** 提出了一个尖锐的警告：

> "Just swiping past AI-generated code without reading it is the wrong mentality. That's not how you build technology."

他和 Naveen 有一个共同原则：**读每一行代码**。Yash 说 LLM 写代码最初让他感觉"被剥夺了玩乐的时间"——他开始写代码是因为热爱，像读书一样。

> "I started writing code because I love it. It's like reading a book."

他到了一个**对自己代码库感到陌生的地步，并拒绝接受这一点**。

### 3. AI 焦虑——从兴奋到不安

**Ryan Carson** 的坦白令人惊讶：

> "I thought AGI, which it feels like we basically are sort of here, I thought it would make my life calm, but it's made it very stressful."

> "The speed that we're all going to get out-iterated here is unprecedented. And I think if you're a founder or a builder, you should be really nervous all the time now."

**Tariq** 也提到了这一点，引用 Dario Amodei 的态度：Anthropic 宁愿事情慢一点。他表达了对公众 AI 焦虑的真诚关切，强调 Anthropic 的使命是"bring people along for the ride"。

### 4. 共识驱动——当 AI 太"正常"

**Brooker Belcourt** 从金融分析的角度提出了一个被低估的问题：

> "LLMs are just very consensus in the way they look at ideas."

在投资领域，共识意味着平庸。他不得不将自己的投资哲学（偏好加速增长的业务、关注轨迹而非绝对值）硬编码进 Claude 插件中，以对抗 LLM 天然的"中庸倾向"。

这个问题不限于金融——**任何需要非共识洞见的领域都面临同样的挑战。**

### 5. 理解幻觉——Dunning-Kruger 的新变体

**Jeffrey Litt** 的"quiz 实践法"直接针对这个问题：

> "It's really easy to convince yourself that you understand something even if you don't."

当 AI 可以在5分钟内生成一个复杂的动画系统，你很容易认为自己"理解"了它。但当你需要修改一个边缘情况时，这种虚假的理解会立刻暴露。

### 6. 经济可行性——自主循环的真实成本

**Tariq** 对 Nat Eliason 等人的"Mac mini 24/7 运行 Claude Code"模式持谨慎态度。他的核心问题是：

> "Is it producing economically viable output?"

他发现写 30 分钟的 spec 可以减少足够的歧义让 Opus 运行更长时间，但这仍然需要大量人类投入。**完全自主仍然是一个开放问题。**

---

## 六、趋势预判：基于这17位的信号

### 短期（3-6个月）

1. **"Tasks"取代"To-Dos"**：Anthropic 即将推出的 Tasks 系统（带依赖图、跨会话持久化）会成为 agent 工作流的新基础设施。
2. **非技术人员大量涌入构建者行列**：Google 的 Amar 预测"到年底，非技术团队构建东西将成为常态"。
3. **Figma → Code 工作流成熟**：从 Figma 设计稿直接到可交互原型的路径将在 Google AI Studio、V0 等工具中成为主流。
4. **Agent Watch / Agent 管理工具**出现：像 Yash 的 Agent Watch 这样的工具会成为标配——当你同时运行3个 agent 时，你需要一个监控面板。

### 中期（6-18个月）

5. **从 CLI 到 Agent-Native GUI 的过渡**：不是回到传统 GUI，而是一种新的界面形态——同时服务于人类操作和 agent 自动化。Jeffrey Litt 的"parity principle"（用户能做的，agent 都能做）会成为设计标准。
6. **Compound Engineering 成为标准实践**：自动化的"学习-应用"循环会从插件变成内置功能。每家公司都会建立自己的"最佳实践知识库"。
7. **一人公司的"天花板"继续上移**：今天一个人能做30-50人团队的事；18个月后可能是100-200人。
8. **视频成为 AI 时代的"真实性锚点"**：Ash 的洞察——当文字和图片都不可信时，实时视频（带有所有不完美）成为最接近"真实连接"的媒介。

### 长期（18个月+）

9. **"Prompt IP"成为核心资产**：Brooker 说得对——prompts 是 IP，应该版本控制、资产化管理。未来会出现"prompt 交易市场"和"prompt 估值框架"。
10. **金融分析→所有知识工作**的范式转移：Brooker 用 Claude + MCP + Streamlit 构建"个人化 Bloomberg"的模式，会扩展到法律、医疗、咨询等所有知识密集型行业。
11. **"Delete Code"成为核心能力**：Tariq 的洞察——当模型每3个月就能接管之前需要手写代码才能实现的功能时，**愿意删除代码的人和团队**将比不愿意的人走得更快。
12. **自主循环从"可以做到"到"值得做"**：Ryan Carson 的 Compound Product 管道已经展示了可能性，但经济可行性仍是开放问题。当模型成本继续下降、质量继续提升，这个问题的答案将从"有时候"变成"几乎总是"。

---

## 七、结语：真正的问题不是"AI 能不能"

回到这场活动的本质。

17位讲者中，没有人问"AI 能不能做这件事"。他们都在问的是：

- **我该怎么组织我的 agent 团队？**（Nat Eliason, Ryan Carson）
- **我该怎么把我的 taste 注入 AI 的输出？**（Kevin Rose, Tina He）
- **我怎么确保我理解 AI 替我做了什么？**（Jeffrey Litt, Yash）
- **我怎么在 AI 的共识倾向中保持非共识洞见？**（Brooker Belcourt）
- **我怎么在不被焦虑淹没的情况下跟上速度？**（Ryan Carson, Tariq）

这些问题不是技术问题。它们是**人的问题**。

正如 **Paula** 在谈到她的团队流程时无意间总结的：

> "If you don't have a Dan, you should get one."

她指的是团队中需要有人 champion 和 own AI 工具的配置。但这句话的含义更深——**在 AI 时代，你需要的不只是工具，你需要一个理解这些工具并愿意不断迭代的人。**

这个人可以是团队中的某个人，也可以是你自己。

但无论如何——**不要再等了。**

> "Once you see it, you can't unsee it." — Kevin Rose

---

*本文为编辑深度分析，基于 Every 的 Vibe Code Camp 8小时直播内容。视频原址：[YouTube](https://www.youtube.com/watch?v=5YBjll9XJlw)*

---
*由 PotatoLearning Hub 深度分析生成*
