---
title: "AI下一个重大突破：不靠变大，而是「回归」？"
original_title: "Beyond Bigger Models: Recursion As The Next Scaling Law In AI"
author: "Y Combinator"
category: "科技趋势"
date: "2026-05-01"
tags: ["科技趋势", "Y Combinator"]
source_url: "https://www.youtube.com/watch?v=DGtUUMNYLcc"
thumbnail: "https://img.youtube.com/vi/DGtUUMNYLcc/maxresdefault.jpg"
---

## 📋 Brief

这支影片深入探讨了AI模型扩展的新方向，不再只是盲目追求更大的模型，而是引入了「递回」的概念。主持人与嘉宾解释了为何传统大型语言模型（LLMs）在面对复杂推理问题时有其先天限制，并介绍了两种利用递回架构来提升模型推理能力的新兴研究——分层推理模型（HRM）和微型递回模型（TRM）。

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| 00:00 - 00:09 | 介绍递回是AI扩展的新方向，而非只靠更大模型。 |
| 00:09 - 03:47 | 回顾RNN的历史与其训练时面临的梯度问题，并与LLM做对比。 |
| 03:47 - 07:34 | 阐述LLM在处理不可压缩推理问题（如排序、数独）时的限制。 |
| 07:34 - 11:12 | 详细解释分层推理模型（HRM）的递回架构与生物启发。 |
| 11:12 - 14:18 | 揭示HRM如何透过深度平衡学习（DEQ）解决梯度问题，取得突破性成果。 |
| 14:18 - 16:17 | 探讨机器学习中生物学启发的优点与潜在误区。 |

---

## 📖 详细内容

### 01｜递回：AI 扩展的新方向

**核心观点：** AI的发展不应该只聚焦在把模型做得越来越大。现在有一个更令人兴奋的方向，那就是利用「递回」来提升模型的推理表现，特别是在推理阶段，这是一个很有潜力的新扩展法则。

**重要原话：**
> "Specifically, we're going to talk about how we can improve a model's reasoning performance by using recursion at inference time rather than by just making the model bigger and bigger."
>
> （中文翻译：具体来说，我们要讨论的是如何在推理时利用递回来改善模型的推理表现，而不是只靠把模型做得越来越大。）

**个人感受：** 我听了这段话感觉像是拨开了迷雾。过去几年一直看到各种超大型模型的新闻，似乎AI的进化就等于「模型更大，参数更多」，但这影片一开始就点出了不一样的路，让我觉得很有意思，迫不及待想知道背后是什么原理。

**延伸思考：** 这种不追求「大」而追求「巧」的思路，让我想到自然界中许多看似简单的结构却能产生复杂行为的系统。AI的发展或许也该学习这种从结构或演算法层面优化，而非仅仅是资源堆砌。

**可参考的行动：** 当我们评估AI技术或产品时，可以多问一句：「除了规模，它还在哪些方面做了架构或演算法上的创新？」

---

### 02｜RNN 的崛起与困境

**核心观点：** 循环神经网路（RNN）在Transformer出现前，曾被认为是实现通用人工智慧（AGI）的关键，它透过对自身进行重复呼叫来处理序列数据。然而，RNN在训练时，由于「时间反向传播」机制会导致梯度消失或梯度爆炸，并需要大量记忆体来储存中间激活值，这大大限制了其处理长序列的能力。相较之下，现代大型语言模型（LLMs）的Transformer架构能「一次性」处理所有时间步的输入，解决了这些梯度问题，但却牺牲了RNN在时间方向上的「压缩」能力和潜在推理优势。

**重要原话：**
> "You have these like vanishing or exploding gradient problems... And even worse, you have to retain the activations at every single step."
>
> （中文翻译：你会遇到梯度消失或梯度爆炸的问题……更糟的是，你必须在每个步骤都保留激活值。）
>
> "There is no compression in LM. Every single decode that I do, I still have to retain the entire, you know, Shakespeare novel just to like decode a little bit. And in RNNs, you don&#39;t have to do that. It&#39;s all compressed in this hidden state that you kind of roll out."
>
> （中文翻译：大型语言模型没有压缩功能。我每次解码，还是必须保留整部莎士比亚小说，只为了解码一小段。但在RNN中，你不需要这样做。它会全部压缩在这种你展开的隐藏状态中。）

**个人感受：** 看到RNN的历史和它面临的这些深层问题，我突然对深度学习领域的演进有了更清晰的认识。感觉就像技术发展总是在解决一个问题的同时，又创造出新的权衡。LLM解决了梯度问题，却失去了RNN的某些优雅之处，这让我思考工程和理论上的取舍。

**延伸思考：** 这段话让我想到，任何技术都有其极限和最佳应用场景。LLM在生成式任务上表现亮眼，但在需要深度、序列性推理的场景下，或许需要不同的架构来补足。

**可参考的行动：** 如果我正在处理需要处理长序列或需要高度压缩记忆体的任务，我会去研究除了Transformer之外，是否有其他如RNN变体或递回模型能提供更有效的解决方案。

---

### 03｜大型语言模型推理的盲点

**核心观点：** 尽管大型语言模型（LLMs）在许多任务上表现惊人，但它们在处理一些「不可压缩」的推理问题时，存在先天的限制。这类问题，例如排序演算法、数独或迷宫，需要模型执行多个相互依赖的计算步骤。由于LLM在本质上是「一次性」的前向传播模型，它们没有足够的「内部计算步骤」或「外部记忆体」来完成这些复杂的、像图灵机一样的迭代处理。即使像「思维链」（Chain-of-Thought）这种技术在推论时能提供帮助，那也只是在测试阶段的「作弊」，而非模型在训练时内建的推理能力。

**重要原话：**
> "it&#39;s actually impossible for the model to map from unsorted list to sorted lists if I have... in a one shot basis... It&#39;s not possible for me to like do all the steps that is needed to be done."
>
> （中文翻译：如果我只有一次机会……模型实际上不可能将未排序的列表映射到已排序的列表……我无法完成所有必要的步骤。）
>
> "the cheat is the the chain of thought... at test time they are uh turn complete and you can simulate all turn computable functions at test time but how do you get it to learn it you need to train it"
>
> （中文翻译：作弊的方法是思维链……在测试时，它们是图灵完备的，你可以在测试时模拟所有图灵可计算函数，但你如何让它学习呢？你需要训练它。）

**个人感受：** 影片中提到LLM无法在一次前向传播中完成排序或数独，这让我蛮震惊的。我总以为这些模型既然能生成长文本、写程式码，应该也能轻松处理这类逻辑问题。原来，「一次性」的设计是把双面刃，让我对LLM的「推理」有了更清醒的认识，不能把它的模式匹配能力误认为真正的深层推理。

**延伸思考：** 这点让我想到，如果我们要让AI解决更具挑战性的科学、数学或工程问题，我们可能需要让模型具备「内省」和「迭代修正」的能力，而不仅仅是给出单一、最终的答案。这可能需要将其与外部工具或更复杂的控制机制结合。

**可参考的行动：** 在使用大型语言模型解决复杂逻辑问题时，我会留意其输出是否真的经过了多步骤的「推理」，而不是表面上的模式匹配，必要时会用更小的、专门的演算法模型来验证结果。

---

### 04｜分层推理模型 (HRM) 的运作原理

**核心观点：** 分层推理模型（HRM）借鉴了循环神经网路（RNN）的理念，并从人脑不同区域以不同频率运作的生物学启发中获得灵感。它设计了三层递回结构：低层、高层和外部精炼步骤，每个层级都在执行类似于递回函数的操作，并共享相同的权重。这种设计让模型能够在不同抽象层次上反复处理输入（例如不完整的数独或迷宫），透过这种层层递进的精炼，逐步接近解决方案。

**重要原话：**
> "There's some that operate at a really high frequency which is on the low level of the hierarchy. Some that operate in a really a low frequency which is the the higher level of the hierarchy. And the interplay between those things is really interesting."
>
> （中文翻译：有些以高频率运作，位于层次结构的低层。有些则以低频率运作，位于层次结构的高层。这些层次之间的相互作用非常有趣。）
>
> "there&#39;s exactly three levels of recursion occurring here. There&#39;s the low level, there&#39;s the high level and then there&#39;s the outer refinement steps."
>
> （中文翻译：这里精确地发生了三个层次的递回。有低层、高层，然后是外部精炼步骤。）

**个人感受：** HRM这种模拟人脑多频率、分层处理资讯的方式，让我觉得很聪明。把递回应用在不同抽象层次上，而不是单一维度，感觉上就更接近我们解决复杂问题的思维模式。尤其听到它共享权重，这又进一步说明了「效率」在设计中被重视。

**延伸思考：** 这种多层次递回的概念，是否也能应用在其他需要逐步精炼或多视角分析的任务上，例如图像生成中的细节叠代，或文本理解中的不同层次语义解析？

**可参考的行动：** 如果我在设计一个需要模型进行多步骤决策或层次化处理的AI系统，我会考虑引入这种多层次、共享权重的递回架构，看能否用更小的模型达到更好的效果。

---

### 05｜HRM 的训练智慧：DEQ 的妙用

**核心观点：** HRM解决了RNN在递回训练时面临的「时间反向传播」问题，其关键在于采用了「深度平衡学习」（DEQ）方法。传统RNN需要反向传播整个递回序列，导致梯度消失和记忆体负担。DEQ透过「定点迭代」策略，只对两个模块进行一次反向传播，并在训练过程中多次重复应用相同的输入批次，每次都从前一次迭代的隐藏状态（carry variable）继续。这种方法避免了完全的回溯，利用隐藏状态的变化作为不同「批次」的效果，在只有2700万参数、且仅用1000个ARC挑战数据训练下，却能超越GPT-3等大型模型，达到70%的SOTA成绩。

**重要原话：**
> "instead of doing what Alex Graves did in all of his papers from neural touring machines to uh adaptive compute time um to differential neurocomputers is he always backropped through all of the recursion steps and he was limited by back through time."
>
> （中文翻译：Alex Graves在他的所有论文中，从神经图灵机到自适应计算时间再到差分神经电脑，他总是对所有递回步骤进行反向传播，但他受限于时间反向传播。）
>
> "What they do instead is they actually do that 16 times. And so and as you do that, you actually can see the change uh in your residuals get less and less and less."
>
> （中文翻译：他们做的是，他们实际重复了16次。这样做之后，你可以看到残差的变化越来越小。）
>
> "this was a only a 27 million parameter model that was only trained on uh arc prize... literally a thousand task which is extremely small there is no pre-training at all... and it can outperform at that time if we go back you know we had um 03 ... and it got like something like 70% on arc prize one at least"
>
> （中文翻译：这是一个只有2700万参数的模型，只在ARC挑战赛上进行了训练……文字上只有一千个任务，数量非常少，完全没有预训练……它在当时能够超越……GPT-3……在ARC挑战赛第一阶段至少取得了约70%的成绩。）

**个人感受：** 我听到HRM能用这么小的模型和数据量，就打败了大型模型在某些任务上的表现，真的让我下巴都掉了。这简直是AI领域的「以小搏大」！特别是他们解决时间反向传播的方式，这种把同一个批次输入重复处理、每次从上次隐藏状态继续的做法，像是变相创造了训练数据的多样性，非常巧妙。

**延伸思考：** 这项技术的突破性成果，证明了「如何训练」与「模型大小」同样重要，甚至可能更重要。它为AI效率和可持续发展开辟了新的路径。如果能在更多场景下验证这种训练方法，将对整个产业产生巨大影响。

**可参考的行动：** 当我们设计或评估AI模型时，应该将注意力从单纯的模型大小转移到模型的架构设计、训练策略以及如何有效利用递回或迭代上。

---

### 06｜生物启发的两面性

**核心观点：** 机器学习领域经常从神经科学中寻求生物学上的启发，因为人脑是一个极度高效且强大的计算工具。从神经网路的基本概念到特定的激活函数，许多设计都源于对生物大脑运作方式的类比。然而，这种启发通常只是一个起点。研究人员常常会发现，虽然生物学原理能激发新点子，但最终证明最有效的方法，却往往是那些在生物学上看似「不合理」或经过高度抽象简化的变体。例如，AlexNet曾引入了生物学启发的功能（如局部抑制），但后来VGG等模型证明，舍弃这些「生物真实性」而单纯加深网路层次，反而能获得更好的性能。

**重要原话：**
> "a lot of machine learning research has for a long time sought analog from how we think to understand our brain to work and try to encode that in various machine learning systems."
>
> （中文翻译：长期以来，许多机器学习研究都试图从我们理解大脑运作方式中寻找类比，并尝试将其编码到各种机器学习系统中。）
>
> "we end up veering away from the bioplausible to something adjacent to them that is likely bioimplausible, but that seems to work better."
>
> （中文翻译：我们最终会偏离生物学上合理的想法，转向那些可能在生物学上不合理，但似乎效果更好的相近事物。）

**个人感受：** 关于生物启发的讨论，我很能理解为什么大家会去借鉴大脑，毕竟它是目前最复杂、最有效的「计算机」。但影片点出，我们常常「被启发」后，最终却发现效果最好的其实是「不那么生物化」的版本，这蛮有趣的。感觉就像是从自然界获取灵感，但为了工程实用性，还是得「改造」一番。

**延伸思考：** 这让我思考，机器学习的目标是解决问题，而不一定是完美模拟生物系统。所以，在追求新技术时，应保持开放的心态，不要过于拘泥于是否「像」生物学，最终还是要以实际效果和效率为判断标准。

**可参考的行动：** 当我看到一个宣称受「生物启发」的AI模型时，我会更仔细地去了解它实际工作原理中的哪些部分是来自生物启发，哪些部分是为了工程效率而做的取舍或创新，并专注于其性能表现，而不是其故事性。

---

## 💎 精华收获

这支影片让我对AI的未来发展有了更清晰的认识：扩展AI能力不只一条路，不全然是追求「更大的模型」。透过引入「递回」和巧妙的训练策略（如DEQ），即使是参数较小的模型，也能在复杂的推理任务上展现出超越大型模型的性能。这告诉我们，AI的智慧可能更多地来自于精巧的架构设计和迭代处理机制，而非单纯的算力或数据堆叠，这为未来AI的发展指明了更高效、更具潜力的新方向。

---
*由 PotatoLearning Hub 自动生成*
