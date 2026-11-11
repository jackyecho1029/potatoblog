---
title: "颠覆AI的未来：为什么只有「够大」远远不够？"
original_title: "François Chollet: Why Scaling Alone Isn’t Enough for AGI"
author: "Y Combinator"
category: "科技趋势"
date: "2026-03-27"
tags: ["科技趋势", "Y Combinator"]
source_url: "https://www.youtube.com/watch?v=k2ZLQC8P7dc"
thumbnail: "https://img.youtube.com/vi/k2ZLQC8P7dc/maxresdefault.jpg"
---

## 📋 Brief

这支影片深入探讨了AI领域的未来发展方向，特别是质疑当前主流的「规模化」路径。François Chollet，Keras的创始人，提出了一个大胆的观点：我们需要跳脱现有的深度学习框架，转向更注重效率和最适化的符号模型，才能真正迈向通用人工智慧（AGI）。

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| 00:00 - 01:01 | 预测AGI时程与介绍NDIA的创新研究目标。 |
| 01:02 - 04:23 | 深度学习的局限与NDIA的符号模型新范式。 |
| 04:24 - 06:15 | 为什么在AI研究中，冒险探索非主流路径是重要的。 |
| 06:16 - 09:41 | 可验证奖励讯号如何驱动编码智能的突破，以及其局限。 |
| 09:41 - 11:29 | François Chollet重新定义AGI，强调学习效率而非仅是自动化。 |
| 11:29 - 12:34 | 质疑LLM在达成人类级学习效率上的根本限制。 |
| 12:35 - 17:23 | ARC-AGI基准测试的由来，以及它如何挑战现有AI模型。 |

---

## 📖 详细内容

### 01｜AGI的预期时程与NDIA的开创性愿景

**核心观点：** François Chollet预计AGI可能在2030年左右出现，但他强调，单纯的AI进步是不会停止的。关键在于我们如何有效利用这波浪潮。他创立的NDIA实验室，正是为了探索一种与现有深度学习截然不同的AI新范式，目标是建构更接近「最适化」的机器学习分支。

**重要原话：**
> "NDIA is this new AGI research lab and we are trying some very different ideas and so our goal is basically to build this new branch of machine learning that will be much closer to optimal unlike unlike deep learning."
>
> （中文翻译：NDIA这个新的AGI研究实验室，我们正在尝试一些非常不同的想法，我们的目标基本上是建立机器学习的一个新分支，它会比深度学习更接近最适化。）

**个人感受：** 听他这样直接说深度学习「不够最适化」，感觉像他已经看穿了这场游戏的本质，并且准备好翻开下一页。这种敢于挑战主流的勇气，让我很欣赏。

**延伸思考：** 这让我想，会不会很多时候我们沉溺于眼前的成功（就像LLM），却错过了更根本、更有效率的解决方案？

**可参考的行动：** 在面对一个问题时，除了直接用最流行的工具，可以多问自己一句：「这真的是最有效率、最根本的解决方案吗？」

---

### 02｜告别深度学习：NDIA的符号模型与最适化追求

**核心观点：** NDIA的研究方向是「程式合成」，这与常见的「程式码生成」不同。他们目标是取代深度学习的底层基础，从根本上重塑机器学习堆栈。具体来说，是将深度学习的参数化曲线模型替换为简洁的「符号模型」，并开发一套「符号下降」机制来训练。这样能让模型更小、数据效率更高、泛化能力更强，也更容易组合。

**重要原话：**
> "We&#39;re building a new learning substrate that&#39;s very different from you know parametric learning deep learning... if you go back to the problem of machine learning you have some input data some target data and you&#39;re trying to find a function that will map the inputs to the targets that will hopefully generalize to new inputs... we&#39;re replacing the parametric curve with a symbolic model that is meant to be as small as possible."
>
> （中文翻译：我们正在建立一个新的学习基底，它与参数化学习、深度学习非常不同...如果你回到机器学习的问题，你有输入数据和目标数据，你试图找到一个函数，将输入映射到目标，并希望能泛化到新的输入...我们正在用一个旨在尽可能小的符号模型来取代参数化曲线。）

**个人感受：** 「符号下降」这个概念真的让我脑洞大开，感觉像是找到了梯度下降之外的一条全新路径。这不是小修小补，而是要重新打造整个引擎，让我对未来AI的可能性充满了想像。

**延伸思考：** 如果这种符号模型真的能大幅减少训练数据和计算资源，那将对AI的普及和应用产生革命性的影响，特别是在资源有限的领域。

**可参考的行动：** 如果你是开发者，可以研究符号AI、解释性AI相关的论文或开源专案，了解其底层逻辑和潜在应用，看看能否将部分思想融入你的工作中。

---

### 03｜为何要走不同的路？拥抱高风险、高报酬的AI研究

**核心观点：** 尽管整个产业都将数十亿资金投入LLM堆栈，因为它当下确实有回报，但Chollet认为，让所有人都做相同的事情是事倍功半的。他预测50年后的AI不会是建立在当前的LLM基础上，因为LLM的效率并不够。他选择「蛙跳」式地直接追求最适化AI的基础，即使成功机率只有10-15%，也值得一试，因为如果他们不做，可能就没人会做了。

**重要原话：**
> "I personally don&#39;t think that machine learning or AI in 50 years is still going to be built on this stack. I think this is a stack that is very price maybe it even gets us to AGI but it&#39;s not as efficient as it should be. I think it&#39;s inevitable that the world of AI will trend over time towards optimality and so I&#39;m trying to sort of like leaprog directly to optimality."
>
> （中文翻译：我个人不认为50年后的机器学习或AI会仍然建立在这个堆栈上。我认为这个堆栈代价很高，也许它甚至能带我们达到AGI，但它的效率不如应有的水平。我认为AI的世界迟早会趋向于最适化，所以我试图直接「蛙跳」到最适化。）

**个人感受：** 他这番话让我感觉很受启发，像是在提醒我们，别只盯著眼前的热点，有时候那些看起来成功机率很低、没人做的事情，才是真正能带来颠覆性变革的。这种「为人类探索未知」的精神非常动人。

**延伸思考：** 这不仅适用于AI研究，也适用于个人发展或创业。当所有人都涌向同一条路时，或许是时候思考：有没有一条更艰难、但潜力无限的「支线任务」？

**可参考的行动：** 审视一下你正在投入时间和精力的专案或学习领域，思考一下，是否有一个你感到有潜力，但目前缺乏关注的「高风险、高报酬」方向？考虑拨出一小部分资源去探索它。

---

### 04｜可验证奖励讯号：LLM编码智能的成功与局限

**核心观点：** 编码代理（coding agents）在LLM基础上的成功，惊讶了许多人，包括Chollet本人。其关键在于「可验证的奖励讯号」（如单元测试）。任何提供这类讯号的领域（如程式码、数学证明）都可以被目前的LLM技术充分自动化。然而，对于「不可验证」的模糊领域（如写作优美的文章、法律判断），进展则会非常缓慢甚至停滞，因为LLM严重依赖高成本的人工标注训练数据。

**重要原话：**
> "If you look at why everything is is starting to work so well with squinging agents, it&#39;s really because code provides you with a verifiable reward signal. And I think right now we&#39;re in this situation where any problem where the solutions you propose can be formally verified and you can actually trust the reward signal... Any domain like this can be fully automated with current technology with with the LM based stack and code is sort of like the first domain to fall but there will be many others in the future. I think mathematics is also is also primed to see a revolution in next few years for the same reasons again because the domain just gives you verifiable rewards."
>
> （中文翻译：如果你看为什么所有东西都开始与编码代理如此顺利地运作，那真正的原因是程式码为你提供了可验证的奖励讯号。我认为现在我们处于这样一种情况：任何问题，如果其提出的解决方案可以被正式验证，并且你可以真正信任这个奖励讯号...任何这样的领域都可以使用目前的LLM堆栈技术完全自动化，程式码是第一个被攻克的领域，但未来会有许多其他领域。我认为数学也准备在未来几年看到一场革命，原因也是一样，因为这个领域本身就提供了可验证的奖励。）

**个人感受：** 我从来没有这样清晰地思考过LLM成功的底层逻辑，这个「可验证奖励讯号」的概念，完美解释了为什么某些领域AI突飞猛进，而另一些则步履维艰。感觉像解开了一个AI能力的谜团。

**延伸思考：** 这也说明了，如果我们想让AI在更多「模糊」领域有所作为，单纯地扩大模型规模可能不是出路，而是要找到一种将这些模糊任务「形式化」或创造「可信赖验证机制」的方法。

**可参考的行动：** 在你的工作或学习中，如果遇到AI应用瓶颈，思考你的任务是否具有「可验证奖励讯号」的特性。如果是，可以尝试应用现有LLM；如果不是，则需考虑如何定义清晰的成功标准或奖励机制。

---

### 05｜AGI的两种定义：效率与自动化的分歧

**核心观点：** 业界普遍将AGI定义为「能自动化大多数具有经济价值的任务」的系统。但Chollet驳斥了这个「关于自动化而非智能」的定义。他提出自己的定义：AGI应是一个能以与人类同等的效率（极低的数据和计算需求）来理解、学习并精通任何新问题、新任务和新领域的系统。他认为，业界的自动化AGI会先实现，但真正的通用智能（高效学习）需要截然不同的技术。

**重要原话：**
> "My definition is AGI is basically going to be a system that can approach any new problem any new task any new domain and make sense of it like model it become competent at it with the same degree of efficiency as a human could. So meaning it&#39;s going to need basically the same amount of training data and training computes as as a human would which is which is very little like humans are really really data efficient."
>
> （中文翻译：我的定义是，AGI基本上将是一个能够以与人类相同的效率，处理任何新问题、新任务、新领域并理解它、建模它、精通它的系统。这意味著它将需要与人类相同数量的训练数据和训练计算，而这非常少，人类真的非常数据高效。）

**个人感受：** Chollet的定义让我对AGI有了更深层次的理解。以前我总觉得AI能做很多事就是智能，但他指出「效率」才是关键，这让我感觉更贴近「智慧」的本质。这就像是，一个机器人能把房子打扫干净是自动化，但它能像个孩子一样快速学习新技能，那才是真智能。

**延伸思考：** 如果我们用「效率」来衡量AGI，那么许多当前的AI模型在数据和算力上的巨大消耗，就显得非常「不智能」了。这为未来AI研究指明了一条更具挑战性也更根本的道路。

**可参考的行动：** 在评估任何新的AI技术时，除了它能做什么，也要额外关注它做这件事的「效率」如何，例如需要多少数据、多少计算资源，而不是只看结果。

---

### 06｜LLM能否达到人类效率？对未来AI基础的省思

**核心观点：** Chollet认为，虽然理论上透过足够的计算能力，并在LLM之上叠加多个抽象层次，或许可以让LLM「看起来」像AGI，但这会非常低效。他坚信，AI研究最终必须趋向于最适化，因此未来几十年后的AI，不会是当前LLM堆栈的延伸，而将是更底层、更根本的创新。

**重要原话：**
> "I do believe however this would be the wrong thing to do because it would be very inefficient. I think AI AI research will have to trend towards not just efficiency but in fact optimality over time and for this reason future AI in a few decades it&#39;s not going to be this harness on top of a reasoning model on top of a basel is going to be much much lower than that."
>
> （中文翻译：然而，我确实相信这样做是错误的，因为它将非常低效。我认为AI研究最终将不得不随著时间的推移，不仅仅是趋向于效率，而是趋向于最适化，因此，几十年后的未来AI，将不会是建立在推理模型之上的基础模型，而将远低于此。）

**个人感受：** 我曾以为只要LLM够大，再辅以一些外挂工具，就能解决所有问题。但听到他这样说，我才意识到这可能只是「表面功夫」，真正的效率突破可能需要从根基改变。这让我觉得当前的AI繁荣虽然令人兴奋，但背后仍潜藏著巨大挑战。

**延伸思考：** 这观点促使我们思考，如果AI的未来不在于无限堆叠复杂度，那么我们是否应该把更多资源投入到基础科学、新的计算范式或生物启发的智能研究上？

**可参考的行动：** 如果你在设计AI系统，除了考虑现有工具的能力，也要开始思考其长期效率和可持续性。问自己，这个解决方案是否在根本上是「最适化」的，还是只是暂时的「权宜之计」？

---

### 07｜ARC-AGI的诞生：从梯度下降困境到智能衡量新标竿

**核心观点：** Chollet分享了他创立Keras的经验，以及2016年在Google Brain研究时，发现梯度下降在处理推理问题时，无法找到可泛化的演算法，而是倾向于过度拟合模式匹配。这促使他意识到需要一个全新的基准来衡量真正的智能。他因此花了数年时间，手工制作了10,000个任务，于2019年发布了ARC-AGI（抽象推理语义）基准测试，旨在衡量「智能作为技能习得效率」，而非ImageNet那样的分类能力。尽管现有的LLM在ARC上表现不佳，初期被主流AI界忽视，但他相信它代表了通向真正AGI的道路。

**重要原话：**
> "I started finding that you could not really get cryion descent to encode uh uh sort of like cresing style algorithms. It was not because the models could not represent these algorithms. It was because cryion descent could not find them. Right? So the problem was that it wasn&#39;t about deep learning not being train or anything like that. Like that was not the problem. The problem was cryon descent right descent would not find generalizable programs. It would instead end up doing overfeit pattern matching right over over sequences of uh uh input tokens"
>
> （中文翻译：我开始发现梯度下降法无法真正地编码推理风格的演算法。这不是因为模型无法表示这些演算法，而是因为梯度下降法找不到它们。问题不在于深度学习无法训练或类似的东西，问题是梯度下降法找不到可泛化的程式，它反而会过度拟合输入标记序列中的模式匹配。）

**个人感受：** 看到他为了这个心中的「未来AI」愿景，花费数年时间手工设计上万个任务，只为创造一个正确的衡量标准，这份执著与远见真的让我深深感动。这种不为短期热度所动，专注于长期目标的精神，太难得了。

**延伸思考：** 这个故事提醒我们，真正的突破往往来自于对现有范式的深刻反思和批判性思考。有时候，我们需要的不是更多的「答案」，而是更好的「问题」和衡量标准。

**可参考的行动：** 如果你在一个领域内工作，试著找出那个领域中被大家视为理所当然的「基准」或「衡量标准」，并思考它是否真的能捕捉到你所追求的核心价值。如果不是，思考如何设计一个更恰当的标准。

---

## 💎 精华收获

François Chollet深度挑战了AI发展的现有路径，指出单纯的规模化远不足以实现真正的AGI。他主张AI的未来在于追求「最适化」的符号模型，强调像人类一样高效学习的能力，而非仅是自动化任务。这支影片提醒我们，真正的智能需要从底层革新，勇于探索非主流的高风险路径，才是通往颠覆性创新的关键。

---
*由 PotatoLearning Hub 自动生成*
