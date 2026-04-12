---
title: "顛覆AI的未來：為什麼只有「夠大」遠遠不夠？"
original_title: "François Chollet: Why Scaling Alone Isn’t Enough for AGI"
author: "Y Combinator"
category: "科技趨勢"
date: "2026-03-27"
tags: ["科技趨勢", "Y Combinator"]
source_url: "https://www.youtube.com/watch?v=k2ZLQC8P7dc"
thumbnail: "https://img.youtube.com/vi/k2ZLQC8P7dc/maxresdefault.jpg"
---

## 📋 Brief

這支影片深入探討了AI領域的未來發展方向，特別是質疑當前主流的「規模化」路徑。François Chollet，Keras的創始人，提出了一個大膽的觀點：我們需要跳脫現有的深度學習框架，轉向更注重效率和最適化的符號模型，才能真正邁向通用人工智慧（AGI）。

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| 00:00 - 01:01 | 預測AGI時程與介紹NDIA的創新研究目標。 |
| 01:02 - 04:23 | 深度學習的局限與NDIA的符號模型新範式。 |
| 04:24 - 06:15 | 為什麼在AI研究中，冒險探索非主流路徑是重要的。 |
| 06:16 - 09:41 | 可驗證獎勵訊號如何驅動編碼智能的突破，以及其局限。 |
| 09:41 - 11:29 | François Chollet重新定義AGI，強調學習效率而非僅是自動化。 |
| 11:29 - 12:34 | 質疑LLM在達成人類級學習效率上的根本限制。 |
| 12:35 - 17:23 | ARC-AGI基準測試的由來，以及它如何挑戰現有AI模型。 |

---

## 📖 詳細內容

### 01｜AGI的預期時程與NDIA的開創性願景

**核心觀點：** François Chollet預計AGI可能在2030年左右出現，但他強調，單純的AI進步是不會停止的。關鍵在於我們如何有效利用這波浪潮。他創立的NDIA實驗室，正是為了探索一種與現有深度學習截然不同的AI新範式，目標是建構更接近「最適化」的機器學習分支。

**重要原話：**
> "NDIA is this new AGI research lab and we are trying some very different ideas and so our goal is basically to build this new branch of machine learning that will be much closer to optimal unlike unlike deep learning."
>
> （中文翻譯：NDIA這個新的AGI研究實驗室，我們正在嘗試一些非常不同的想法，我們的目標基本上是建立機器學習的一個新分支，它會比深度學習更接近最適化。）

**個人感受：** 聽他這樣直接說深度學習「不夠最適化」，感覺像他已經看穿了這場遊戲的本質，並且準備好翻開下一頁。這種敢於挑戰主流的勇氣，讓我很欣賞。

**延伸思考：** 這讓我想，會不會很多時候我們沉溺於眼前的成功（就像LLM），卻錯過了更根本、更有效率的解決方案？

**可參考的行動：** 在面對一個問題時，除了直接用最流行的工具，可以多問自己一句：「這真的是最有效率、最根本的解決方案嗎？」

---

### 02｜告別深度學習：NDIA的符號模型與最適化追求

**核心觀點：** NDIA的研究方向是「程式合成」，這與常見的「程式碼生成」不同。他們目標是取代深度學習的底層基礎，從根本上重塑機器學習堆棧。具體來說，是將深度學習的參數化曲線模型替換為簡潔的「符號模型」，並開發一套「符號下降」機制來訓練。這樣能讓模型更小、數據效率更高、泛化能力更強，也更容易組合。

**重要原話：**
> "We&#39;re building a new learning substrate that&#39;s very different from you know parametric learning deep learning... if you go back to the problem of machine learning you have some input data some target data and you&#39;re trying to find a function that will map the inputs to the targets that will hopefully generalize to new inputs... we&#39;re replacing the parametric curve with a symbolic model that is meant to be as small as possible."
>
> （中文翻譯：我們正在建立一個新的學習基底，它與參數化學習、深度學習非常不同...如果你回到機器學習的問題，你有輸入數據和目標數據，你試圖找到一個函數，將輸入映射到目標，並希望能泛化到新的輸入...我們正在用一個旨在盡可能小的符號模型來取代參數化曲線。）

**個人感受：** 「符號下降」這個概念真的讓我腦洞大開，感覺像是找到了梯度下降之外的一條全新路徑。這不是小修小補，而是要重新打造整個引擎，讓我對未來AI的可能性充滿了想像。

**延伸思考：** 如果這種符號模型真的能大幅減少訓練數據和計算資源，那將對AI的普及和應用產生革命性的影響，特別是在資源有限的領域。

**可參考的行動：** 如果你是開發者，可以研究符號AI、解釋性AI相關的論文或開源專案，了解其底層邏輯和潛在應用，看看能否將部分思想融入你的工作中。

---

### 03｜為何要走不同的路？擁抱高風險、高報酬的AI研究

**核心觀點：** 儘管整個產業都將數十億資金投入LLM堆棧，因為它當下確實有回報，但Chollet認為，讓所有人都做相同的事情是事倍功半的。他預測50年後的AI不會是建立在當前的LLM基礎上，因為LLM的效率並不夠。他選擇「蛙跳」式地直接追求最適化AI的基礎，即使成功機率只有10-15%，也值得一試，因為如果他們不做，可能就沒人會做了。

**重要原話：**
> "I personally don&#39;t think that machine learning or AI in 50 years is still going to be built on this stack. I think this is a stack that is very price maybe it even gets us to AGI but it&#39;s not as efficient as it should be. I think it&#39;s inevitable that the world of AI will trend over time towards optimality and so I&#39;m trying to sort of like leaprog directly to optimality."
>
> （中文翻譯：我個人不認為50年後的機器學習或AI會仍然建立在這個堆棧上。我認為這個堆棧代價很高，也許它甚至能帶我們達到AGI，但它的效率不如應有的水平。我認為AI的世界遲早會趨向於最適化，所以我試圖直接「蛙跳」到最適化。）

**個人感受：** 他這番話讓我感覺很受啟發，像是在提醒我們，別只盯著眼前的熱點，有時候那些看起來成功機率很低、沒人做的事情，才是真正能帶來顛覆性變革的。這種「為人類探索未知」的精神非常動人。

**延伸思考：** 這不僅適用於AI研究，也適用於個人發展或創業。當所有人都湧向同一條路時，或許是時候思考：有沒有一條更艱難、但潛力無限的「支線任務」？

**可參考的行動：** 審視一下你正在投入時間和精力的專案或學習領域，思考一下，是否有一個你感到有潛力，但目前缺乏關注的「高風險、高報酬」方向？考慮撥出一小部分資源去探索它。

---

### 04｜可驗證獎勵訊號：LLM編碼智能的成功與局限

**核心觀點：** 編碼代理（coding agents）在LLM基礎上的成功，驚訝了許多人，包括Chollet本人。其關鍵在於「可驗證的獎勵訊號」（如單元測試）。任何提供這類訊號的領域（如程式碼、數學證明）都可以被目前的LLM技術充分自動化。然而，對於「不可驗證」的模糊領域（如寫作優美的文章、法律判斷），進展則會非常緩慢甚至停滯，因為LLM嚴重依賴高成本的人工標註訓練數據。

**重要原話：**
> "If you look at why everything is is starting to work so well with squinging agents, it&#39;s really because code provides you with a verifiable reward signal. And I think right now we&#39;re in this situation where any problem where the solutions you propose can be formally verified and you can actually trust the reward signal... Any domain like this can be fully automated with current technology with with the LM based stack and code is sort of like the first domain to fall but there will be many others in the future. I think mathematics is also is also primed to see a revolution in next few years for the same reasons again because the domain just gives you verifiable rewards."
>
> （中文翻譯：如果你看為什麼所有東西都開始與編碼代理如此順利地運作，那真正的原因是程式碼為你提供了可驗證的獎勵訊號。我認為現在我們處於這樣一種情況：任何問題，如果其提出的解決方案可以被正式驗證，並且你可以真正信任這個獎勵訊號...任何這樣的領域都可以使用目前的LLM堆棧技術完全自動化，程式碼是第一個被攻克的領域，但未來會有許多其他領域。我認為數學也準備在未來幾年看到一場革命，原因也是一樣，因為這個領域本身就提供了可驗證的獎勵。）

**個人感受：** 我從來沒有這樣清晰地思考過LLM成功的底層邏輯，這個「可驗證獎勵訊號」的概念，完美解釋了為什麼某些領域AI突飛猛進，而另一些則步履維艱。感覺像解開了一個AI能力的謎團。

**延伸思考：** 這也說明了，如果我們想讓AI在更多「模糊」領域有所作為，單純地擴大模型規模可能不是出路，而是要找到一種將這些模糊任務「形式化」或創造「可信賴驗證機制」的方法。

**可參考的行動：** 在你的工作或學習中，如果遇到AI應用瓶頸，思考你的任務是否具有「可驗證獎勵訊號」的特性。如果是，可以嘗試應用現有LLM；如果不是，則需考慮如何定義清晰的成功標準或獎勵機制。

---

### 05｜AGI的兩種定義：效率與自動化的分歧

**核心觀點：** 業界普遍將AGI定義為「能自動化大多數具有經濟價值的任務」的系統。但Chollet駁斥了這個「關於自動化而非智能」的定義。他提出自己的定義：AGI應是一個能以與人類同等的效率（極低的數據和計算需求）來理解、學習並精通任何新問題、新任務和新領域的系統。他認為，業界的自動化AGI會先實現，但真正的通用智能（高效學習）需要截然不同的技術。

**重要原話：**
> "My definition is AGI is basically going to be a system that can approach any new problem any new task any new domain and make sense of it like model it become competent at it with the same degree of efficiency as a human could. So meaning it&#39;s going to need basically the same amount of training data and training computes as as a human would which is which is very little like humans are really really data efficient."
>
> （中文翻譯：我的定義是，AGI基本上將是一個能夠以與人類相同的效率，處理任何新問題、新任務、新領域並理解它、建模它、精通它的系統。這意味著它將需要與人類相同數量的訓練數據和訓練計算，而這非常少，人類真的非常數據高效。）

**個人感受：** Chollet的定義讓我對AGI有了更深層次的理解。以前我總覺得AI能做很多事就是智能，但他指出「效率」才是關鍵，這讓我感覺更貼近「智慧」的本質。這就像是，一個機器人能把房子打掃乾淨是自動化，但它能像個孩子一樣快速學習新技能，那才是真智能。

**延伸思考：** 如果我們用「效率」來衡量AGI，那麼許多當前的AI模型在數據和算力上的巨大消耗，就顯得非常「不智能」了。這為未來AI研究指明了一條更具挑戰性也更根本的道路。

**可參考的行動：** 在評估任何新的AI技術時，除了它能做什麼，也要額外關注它做這件事的「效率」如何，例如需要多少數據、多少計算資源，而不是只看結果。

---

### 06｜LLM能否達到人類效率？對未來AI基礎的省思

**核心觀點：** Chollet認為，雖然理論上透過足夠的計算能力，並在LLM之上疊加多個抽象層次，或許可以讓LLM「看起來」像AGI，但這會非常低效。他堅信，AI研究最終必須趨向於最適化，因此未來幾十年後的AI，不會是當前LLM堆棧的延伸，而將是更底層、更根本的創新。

**重要原話：**
> "I do believe however this would be the wrong thing to do because it would be very inefficient. I think AI AI research will have to trend towards not just efficiency but in fact optimality over time and for this reason future AI in a few decades it&#39;s not going to be this harness on top of a reasoning model on top of a basel is going to be much much lower than that."
>
> （中文翻譯：然而，我確實相信這樣做是錯誤的，因為它將非常低效。我認為AI研究最終將不得不隨著時間的推移，不僅僅是趨向於效率，而是趨向於最適化，因此，幾十年後的未來AI，將不會是建立在推理模型之上的基礎模型，而將遠低於此。）

**個人感受：** 我曾以為只要LLM夠大，再輔以一些外掛工具，就能解決所有問題。但聽到他這樣說，我才意識到這可能只是「表面功夫」，真正的效率突破可能需要從根基改變。這讓我覺得當前的AI繁榮雖然令人興奮，但背後仍潛藏著巨大挑戰。

**延伸思考：** 這觀點促使我們思考，如果AI的未來不在於無限堆疊複雜度，那麼我們是否應該把更多資源投入到基礎科學、新的計算範式或生物啟發的智能研究上？

**可參考的行動：** 如果你在設計AI系統，除了考慮現有工具的能力，也要開始思考其長期效率和可持續性。問自己，這個解決方案是否在根本上是「最適化」的，還是只是暫時的「權宜之計」？

---

### 07｜ARC-AGI的誕生：從梯度下降困境到智能衡量新標竿

**核心觀點：** Chollet分享了他創立Keras的經驗，以及2016年在Google Brain研究時，發現梯度下降在處理推理問題時，無法找到可泛化的演算法，而是傾向於過度擬合模式匹配。這促使他意識到需要一個全新的基準來衡量真正的智能。他因此花了數年時間，手工製作了10,000個任務，於2019年發布了ARC-AGI（抽象推理語義）基準測試，旨在衡量「智能作為技能習得效率」，而非ImageNet那樣的分類能力。儘管現有的LLM在ARC上表現不佳，初期被主流AI界忽視，但他相信它代表了通向真正AGI的道路。

**重要原話：**
> "I started finding that you could not really get cryion descent to encode uh uh sort of like cresing style algorithms. It was not because the models could not represent these algorithms. It was because cryion descent could not find them. Right? So the problem was that it wasn&#39;t about deep learning not being train or anything like that. Like that was not the problem. The problem was cryon descent right descent would not find generalizable programs. It would instead end up doing overfeit pattern matching right over over sequences of uh uh input tokens"
>
> （中文翻譯：我開始發現梯度下降法無法真正地編碼推理風格的演算法。這不是因為模型無法表示這些演算法，而是因為梯度下降法找不到它們。問題不在於深度學習無法訓練或類似的東西，問題是梯度下降法找不到可泛化的程式，它反而會過度擬合輸入標記序列中的模式匹配。）

**個人感受：** 看到他為了這個心中的「未來AI」願景，花費數年時間手工設計上萬個任務，只為創造一個正確的衡量標準，這份執著與遠見真的讓我深深感動。這種不為短期熱度所動，專注於長期目標的精神，太難得了。

**延伸思考：** 這個故事提醒我們，真正的突破往往來自於對現有範式的深刻反思和批判性思考。有時候，我們需要的不是更多的「答案」，而是更好的「問題」和衡量標準。

**可參考的行動：** 如果你在一個領域內工作，試著找出那個領域中被大家視為理所當然的「基準」或「衡量標準」，並思考它是否真的能捕捉到你所追求的核心價值。如果不是，思考如何設計一個更恰當的標準。

---

## 💎 精華收穫

François Chollet深度挑戰了AI發展的現有路徑，指出單純的規模化遠不足以實現真正的AGI。他主張AI的未來在於追求「最適化」的符號模型，強調像人類一樣高效學習的能力，而非僅是自動化任務。這支影片提醒我們，真正的智能需要從底層革新，勇於探索非主流的高風險路徑，才是通往顛覆性創新的關鍵。

---
*由 PotatoLearning Hub 自动生成*
