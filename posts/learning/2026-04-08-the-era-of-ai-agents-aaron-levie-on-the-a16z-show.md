---
title: "当 AI Agent 成为软体的主要用户：Box CEO Aaron Levie 的企业软体预言"
original_title: "The Era of AI Agents | Aaron Levie on The a16z Show"
author: "a16z"
category: "科技趋势"
date: "2026-04-08"
tags: ["科技趋势", "a16z", "AI", "企业软体", "Agent"]
source_url: "https://www.youtube.com/watch?v=dvt_74kV-RM"
thumbnail: "https://img.youtube.com/vi/dvt_74kV-RM/maxresdefault.jpg"
---

## 📋 Brief

Box CEO Aaron Levie 和 a16z 的 Erik Torenberg、Steven Sinofsky、Martin Casado 坐在一起，聊了一个很实际的问题：当一家公司的 agent 数量是人类员工的一百倍，软体该怎么设计？话题从「写程式的 agent 为什么比其他 agent 成功」一路聊到「要不要给你的 agent 一张独立信用卡」，中间穿插了试算表普及的历史类比和 CFO 们的恐慌。整场对话的底色是：这件事没有矽谷想的那么快，但方向已经定了。

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| 00:00 - 02:10 | 开场：软体要为 agent 而建，不是为人类 — agent 数量将是人类的百倍甚至千倍 |
| 02:10 - 05:00 | 演算法思维很难：大多数人连自己工作的流程图都画不出来，更别说指挥 agent |
| 05:00 - 08:30 | 历史类比：从 HP 计算器到试算表，技术普及永远需要时间，但最终整个抽象层会上升 |
| 08:30 - 11:00 | 程式码 → 终端 → 电脑操作：agent 使用软体的方式正在从写程式退化到更像人类操作 |
| 11:00 - 15:30 | 即时整合：agent 能在执行当下把两个从未连接的系统串起来，CFO 听了很紧张 |
| 15:30 - 18:40 | Box CLI 实战：用 Claude Code 操作 Box 的兴奋与混乱，以及「给 agent 自己的信用卡」这个务实方案 |

---

## 📖 详细内容

### 01｜软体的第一用户正在变成 agent

**核心观点：** Aaron 说 Box 现在花在「agent 介面」上的时间已经跟「人类介面」一样多了。原因很简单：如果 agent 的数量是人类的 100 倍甚至 1000 倍，那软体当然要优先服务 agent。但 Aaron 马上泼了冷水，他说「vibe code your way to SAP」是荒谬的，SAP 背后几十年的产业知识不是一个漂亮的资料层就能替代的。

**重要原话：**
> 「现在大家抽象地说什么『你要对 agent 行销，你要有好的 API』，我觉得这几乎是完全错的。」
>
> （原文："People in the abstract say things like, 'Now you're marketing to agents that you're like an API. You've got a good IDL.' I actually think that's almost exactly wrong."）

**个人感受：** 「把软体做好给 agent 用」这句话听起来很合理，但 Aaron 说 API first 是错的时候我愣了一下。他的意思是 agent 最终会像人一样直接操作 UI，而不是走后门 API。这跟我之前的直觉完全相反。

**延伸思考：** 如果 agent 真的变成软体的主要用户，那 SaaS 公司的护城河会怎么变？现在靠 UI 锁住用户的公司，可能反而比 API-first 的公司更安全，因为 agent 操作 UI 的能力在快速进步。

**可参考的行动：** 打开你公司用的主要工具，问自己一个问题：如果明天要让一个 AI agent 接手我 80% 的操作，这个工具的设计是帮助还是阻碍？记下三个最大的摩擦点。

---

### 02｜大多数人画不出自己工作的流程图

**核心观点：** Steven Sinofsky 抛出了一个不舒服的事实：你随便找一个人，让他把日常工作画成流程图，大部分人会失败。一个 50 人的行销团队里，可能只有一个人能完整描述整个流程。所以就算你把最强的 co-working agent 放在他们面前，他们也不知道该怎么指挥它。

**重要原话：**
> 「演算法思维对绝大多数有工作的人来说，是非常非常困难的。」
>
> （原文："Algorithmic thinking is really really really hard for the vast majority of people who have jobs."）

**个人感受：** 这句话刺了一下。我回头想想自己，确实很多时候做事靠直觉和经验，要我把步骤一五一十拆解清楚，有时候也会卡住。这不是智商问题，是思维方式的问题。

**延伸思考：** 这解释了为什么 coding agent 第一个成功：写程式本身就是一种演算法思维，工程师本来就在做「画流程图」这件事。但行销、人资、财务的人没受过这个训练。agent 想要真正普及到非技术岗位，可能得先帮用户把隐性知识变成显性知识。

**可参考的行动：** 今天试一个练习：挑一件你每周都做的重复性工作，花 15 分钟把每个步骤写下来，精确到「点哪个按钮、输入什么文字」。你会发现比想像中难，但这个练习本身就是未来指挥 agent 的基本功。

---

### 03｜试算表的历史告诉我们什么

**核心观点：** Sinofsky 讲了他表妹的故事。MBA 毕业进银行，完全不会用试算表，公司让她带一群实习生帮她做表格。两年后，她和同梯全都变成了试算表高手。他认为 agent 现在就处于「需要一群实习生帮忙」的过渡期，但很快那些「实习生」会内化成一种普遍技能。

**重要原话：**
> 「现在你要像火箭科学家一样才能架出 42 个 agent 来做行销自动化。但火箭科学那部分很快就会蒸发掉。」
>
> （原文："Right now you have to be a rocket scientist and the growth marketing person to create 42 agents and spin them all up. But the rocket science part of it just is going to evaporate in very short order."）

**个人感受：** 这个类比让我安心了不少。我现在用 agent 的感觉确实像那个刚进银行不会用 Excel 的人，到处找人帮忙，但心里知道两年后这些都会变成基本技能。问题是，两年能不能等？

**延伸思考：** 每一次抽象层的提升，都会消灭一批旧岗位，同时创造一批新技能的需求。关键不是「agent 会不会取代我」，而是「我能多快从用实习生的人变成自己用试算表的人」。

**可参考的行动：** 每周花一小时用 agent（Claude Code、Cursor、或任何你顺手的工具）做一件你以前手动做的事。不需要一次到位，先让自己习惯这种工作方式。累积三个月再回头看，你会发现差距拉开了。

---

### 04｜从写程式到「用电脑」：agent 的演化方向

**核心观点：** Martin Casado 指出一个反直觉的趋势：大家以为 agent 会越来越依赖写程式，但其实正在反过来。先是写程式，然后退化到用终端机（其实是更少的程式码），现在 2026 年是「computer use」年，agent 直接像人一样操作软体介面。Aaron 补充说 Box 的 agent 能在「用现有功能」「呼叫 API」「当场写一段程式码」三个选项之间动态选择，其中当场写程式码的能力虽然只占 10% 的场景，却解决了不可能提前预测的需求。

**重要原话：**
> 「我们从程式码开始，然后退到终端机，现在是 computer use。它们更像人类在使用电脑，而不是在生成程式码。」
>
> （原文："We started with code, then we went to the terminal which is actually less code. And now this year is going to be the year of computer use. They're much more like humans using computers than generating code."）

**个人感受：** 我之前一直觉得「computer use」是个笨方案，像是退而求其次。但 Casado 的观点让我重新想了想：也许 agent 直接操作 UI 才是最自然的路，因为大多数软体本来就是为人类设计的。绕过 UI 去写程式码反而是更不自然的方式。

**延伸思考：** 如果 agent 操作 UI 的能力越来越强，那所有「No-Code」工具的价值主张都需要重新评估。因为 agent 不需要你的可视化拖拽介面，它可以直接操作底层软体。

**可参考的行动：** 下次你花时间写脚本或用 API 自动化某个流程时，先问一下自己：如果 agent 能直接操作那个软体的介面，我还需要这个脚本吗？把这个问题当成一个思维训练，开始分辨哪些自动化是「结构性的」，哪些只是「介面不好用」的产物。

---

### 05｜即时整合：CFO 们的噩梦与机会

**核心观点：** Aaron 认为 agent 最厉害的能力之一是「即时整合」，意思是 agent 能在你需要的瞬间把两个从未连接的系统串起来，而不是等 IT 团队花三个月做整合。Sinofsky 说他跟一群 CFO 和 CIO 讲这件事，六个人跑来说他「疯了，已经失去可信度了」。他们的恐惧不是 agent 本身，而是「放人类随便做整合」这件事，因为随便连 system 27 和 system 38 可能搞坏整套系统。

**重要原话：**
> 「他们怕的不是 agent 本身，而是让人类随便做整合。你让人去建新的 API，等于是说『请搞坏我的系统吧』。」
>
> （原文："Their fear is like unleashing not just the agents themselves but humans to do integration because you put people creating new integrations and you just say please break my system of record."）

**个人感受：** 我能理解那些 CFO 的反应。在一个跑了 20 年 SAP 的公司里，突然有人说「让 agent 即时串接你的系统」，这跟说「让实习生直接改你的 ERP」差不多可怕。但 Aaron 的回应也对：先从唯读开始，先把资料查询做好，写入和修改慢慢来。

**延伸思考：** 企业软体的世界有两种：一种是「system of record」（记录系统，不能乱动），一种是「consumption layer」（消费层，随便玩）。agent 会先从后者突破，前者会有很长的过渡期。这也意味著，做企业资料查询和分析的工具可能比做企业流程自动化的工具更快被 agent 颠覆。

**可参考的行动：** 盘点你公司里有哪些系统是「绝对不能乱动」的，有哪些是「查询无所谓」的。对后者，下周试著用 agent 做一次跨系统的资料查询，体验一下即时整合的能力边界在哪里。

---

### 06｜给你的 agent 一张信用卡

**核心观点：** Aaron 描述了 Box 推出 CLI 后的真实场景：5000 人的公司每个人都用 Claude Code 操作 Box，一小时可能打 10000 次请求，档案被搬来搬去，有人正在写入的时候另一个 agent 在删除。Sinofsky 分享了他的解法：给 agent 自己的电话号码、自己的 Gmail 帐号、自己的信用卡。与其建一整套新的权限管理系统，不如直接把 agent 当成一个新人类来管理。

**重要原话：**
> 「你不需要建另一套权限管理。你只需要把它当成一个独立的人类来对待。」
>
> （原文："You have to treat it like a human, as a separate human, and then instead of building another auth layer."）

**个人感受：** 这个解法粗糙到有点好笑，但想想又很合理。Gmail 本身就有完整的权限管理系统，企业的 AD/LDAP 也早就成熟了。为什么要重新发明轮子？直接把 agent 当新员工入职，现有的所有管理机制都能用。

**延伸思考：** 这暗示了一个更大的趋势：未来公司的人力资源系统可能要管理的不只是人类员工，还有 agent 员工。每个 agent 有自己的帐号、权限、甚至预算。「AI 原生」的企业可能不是从零建系统，而是把现有的身份管理框架直接延伸到 agent 身上。

**可参考的行动：** 如果你现在在用 agent 工具（Claude Code、Cursor 等），试试建立一个独立的工作帐号给它，而不是用你自己的主帐号。观察这个简单的改变怎么影响你的风险管理和权限控制思维。

---

## 💎 精华收获

这场对话最值得带走的是一个务实的框架：agent 的普及不会是一次性的革命，而是一层一层的抽象提升，就像当年从计算器到试算表、从命令列到图形介面。现在的 agent 还处在「你需要是火箭科学家才能用好」的阶段，但这个门槛正在快速降低。对企业来说，最安全的切入点是从唯读的资料查询和跨系统整合开始；对个人来说，最重要的是现在就开始练习把隐性知识变成显性流程，因为这是指挥 agent 的基本功。至于管理混乱的方法，可能比你想的更简单：给 agent 一个独立身份，用现有的制度管它。
