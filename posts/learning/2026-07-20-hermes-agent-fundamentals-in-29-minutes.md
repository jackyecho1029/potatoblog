---
title: '你有一台24小时运作的AI大脑吗？29分钟学会打造会成长的私人特助'
original_title: 'Hermes Agent Fundamentals In 29 Minutes'
author: 'tina_huang'
category: '科技趋势'
date: "2026-07-20"
tags: ['科技趋势', 'tina_huang']
source_url: "https://www.youtube.com/watch?v=5_N84t1rUU0"
thumbnail: "https://img.youtube.com/vi/5_N84t1rUU0/maxresdefault.jpg"
---

## 📋 Brief

这支影片是一份从零开始设定「Hermes Agent」的完整指南。作者手把手教你怎么根据自己的硬体设备和预算，搭建一个能24小时帮你跑研究、管资讯、自动执行工作的AI特助。最大亮点是它能「学会」你教它的技能，越用越聪明。

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| 00:00 - 01:26 | 影片开场与大纲：为何正确设定你的AI特助是成败关键 |
| 01:27 - 02:57 | 硬体选择：从顶级 Mac Studio 到免费的现有电脑，四种方案比较 |
| 02:57 - 05:13 | 下载与基础设定：桌面应用程式安装、连结模型与首次互动 |
| 05:13 - 07:49 | 记忆系统解密：让AI记住你是谁，以及它把记忆存在哪里 |
| 07:50 - 10:50 | 核心功能一：内建工具与整合第三方软体（如Discord） |
| 10:50 - 14:18 | 核心功能二：技能系统——教你的AI学习新本事，并自动储存 |
| 14:18 - 15:00 | 核心功能三：定时任务（Cron Jobs）让它自动化重复性工作 |

---

## 📖 详细内容

### 01｜你的AI特助，从哪里开始？

**核心观点：** 这支影片的核心是「正确设定」。作者认为，设定得对，你的AI特助就能成为一个可持续扩展、日益强大的工作伙伴；设定不好，只会让你体验极差。他会分享自己用了四个多月的多代理系统，并提供具体的提示词和工作流让你直接抄。

**重要原话：**
> "Setting up your Hermes Agent correctly is so important. It's the difference between having a terrible time versus being able to build something sustainable that you can build on top of and become more magical every day."
>
> （原文：正确设定你的Hermes Agent太重要了。这决定了你会有一段糟糕的体验，还是能建立一个可持续、不断叠加、每天都能变得更神奇的东西。）

**个人感受：** 这段话直接点中要害。很多人玩AI工具半途而废，很可能就是一开始没搞好，觉得麻烦又没效果，直接放弃了。他把这个准备工作形容成「魔法」的基础，听起来就很有动力想跟著做。

**延伸思考：** 不只是Hermes，任何强大的工具都需要正确的「初始化」。花时间把基础打好，后面的效率提升是指数级的。

**可参考的行动：** 在看下一步之前，先问自己一个问题：我期望这个AI特助最帮我解决哪一件重复又耗时的事？把这个目标写下来。

---

### 02｜硬体选择：你的AI大脑住哪里？

**核心观点：** 运行AI模型需要算力。作者提供了四种选择：1）专用强力主机（如Mac Studio），2）云端虚拟伺服器（VPS，每月几美元），3）闲置的旧电脑或笔电（他就是从这里开始），4）你正在用的个人电脑（但强烈建议用Docker隔离）。

**重要原话：**
> "You can also have very powerful Hermes Agent setups with other options... The third option is just to use any old computer or laptop that you happen to have around... This is actually where I started."
>
> （原文：你也可以用其他选项搭建非常强大的Hermes Agent...第三个选项就是用你手边任何闲置的旧电脑或笔电...这其实就是我的起点。）

**个人感受：** 这点很实际。不是每个人都有钱买高配设备。听到他是从16GB RAM的旧MacBook Pro开始的，感觉亲切多了，降低了开始的门槛。用Docker隔离保护个人电脑的提醒也很贴心。

**延伸思考：** 技术民主化就体现在这里。强大的AI能力不再只属于有钱人，而是可以「租」（VPS）或「利用」（旧设备）的。

**可参考的行动：** 检查一下你家里有没有闲置的笔电或电脑（RAM至少8GB）。如果有，下一步就是查一下怎么用Docker。

---

### 03｜记忆系统：让AI真正「认得」你

**核心观点：** 设定好后，第一件事是「自我介绍」。作者建议可以从另一个聊天机器人（如Claude）那里复制一份关于你自己的描述贴给Hermes。Hermes会把这些资讯存成一个人类可读的Markdown档案在你的电脑里，这是它记忆的基础。

**重要原话：**
> "You can literally see everything that's contained here... This is literally like human readable. You can read it yourself what Hermes knows about you."
>
> （原文：你真的可以看到这里面的所有内容...这完全是人类可读的。你自己就能读出Hermes知道关于你的哪些事。）

**个人感受：** 看到记忆以文字档案形式存在自己的电脑里，有一种踏实感和掌控感。不像有些AI的记忆是黑箱，你可以随时去检视甚至手动修改它对你的认识。

**延伸思考：** 这其实是在和AI建立一种「结构化关系」。你提供清晰的上下文，它就能提供更个人化的服务。这份「用户档案」会是未来所有AI助理的标配吗？

**可参考的行动：** 打开你的笔记软体，写下三件你希望AI特助最了解你的事（例如：你的职业、你的工作风格、你最常需要处理的文件类型）。

---

### 04｜技能系统：教你自己的AI「新才艺」

**核心观点：** 这是Hermes的招牌功能。它能随著合作，学会新的技能（本质是一套完成任务的指令手册）。你可以在工作中直接「教」它，例如完成一次商业点子评估后，要求它「把这个流程变成一个技能」，下次就能用斜线命令快速调用。

**重要原话：**
> "Make this into a skill for evaluating business ideas... And it was able to make this skill... Now I have that skill available to me and I can do /business-idea-evaluator."
>
> （原文：「把这个变成一个评估商业点子的技能」...它成功创造了这个技能...现在我有这个技能可以用了，我可以输入 /business-idea-evaluator 来调用它。）

**个人感受：** 这功能太有想像空间了。等于你在创造一个只属于你的、会成长的软体库。从「用户」变成了「共同创造者」，那种感觉很不一样。

**延伸思考：** 未来的竞争力，可能不是你会不会用AI，而是你能不能为自己或自己的领域，「炼制」出一整套独特的AI技能包。

**可参考的行动：** 回想你上周做过的一件重复性文书工作（例如：整理会议纪录、撰写特定格式的报告）。下次做的时候，尝试一步步让AI跟著你做，完成后命令它：「将刚才的步骤保存为一个名为『XXX』的技能。」

---

### 05｜定时任务与整合：让它主动帮你工作

**核心观点：** 透过「定时任务」（Cron Jobs），你可以让AI在固定时间自动执行工作，比如每天早上11点跑一份AI简报。而透过「整合」（Integrations），你能把Hermes连接到Discord、Telegram等平台，让它能直接在这些地方跟你互动、发送通知。

**重要原话：**
> "A cron job is a scheduled task that runs automatically at certain times or specific intervals without having to manually trigger it... I have daily scheduled brief that I have at 11."
>
> （原文：定时任务是一种排程任务，能在特定时间或间隔自动运行，不需要手动触发...我有每天早上11点的排程简报。）

**个人感受：** 这才是从「聊天机器人」到「私人特助」的跨越。当它开始主动按时帮你做事、把结果推到你手机上的时候，你会真切感觉到有个伙伴在帮你分担工作量。

**延伸思考：** 这模糊了软体与员工的界线。设定好规则和整合后，AI就成了你团队里一个不会请假、持续运作的数位成员。

**可参考的行动：** 打开你的通讯软体（如Discord），建立一个专属频道，名字就叫「AI简报」。这是你未来接收AI自动报告的第一步。

---

## 💎 精华收获

这支影片最大的价值，是把一个看似复杂的「搭建AI特助」工程，拆解成从选硬体、装软体、教记忆、学技能到设定自动化的清晰步骤。它不仅给你工具，更给了一个思路：别把AI当成一次性的聊天对象，而是投入时间与它共同成长，打造一个真正理解你、能帮你处理具体事务的长期合作伙伴。

---
*由 PotatoLearning Hub 自动生成*
