---
title: "AI下一個重大突破：不靠變大，而是「迴歸」？"
original_title: "Beyond Bigger Models: Recursion As The Next Scaling Law In AI"
author: "Y Combinator"
category: "科技趨勢"
date: "2026-05-01"
tags: ["科技趨勢", "Y Combinator"]
source_url: "https://www.youtube.com/watch?v=DGtUUMNYLcc"
thumbnail: "https://img.youtube.com/vi/DGtUUMNYLcc/maxresdefault.jpg"
---

## 📋 Brief

這支影片深入探討了AI模型擴展的新方向，不再只是盲目追求更大的模型，而是引入了「遞迴」的概念。主持人與嘉賓解釋了為何傳統大型語言模型（LLMs）在面對複雜推理問題時有其先天限制，並介紹了兩種利用遞迴架構來提升模型推理能力的新興研究——分層推理模型（HRM）和微型遞迴模型（TRM）。

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| 00:00 - 00:09 | 介紹遞迴是AI擴展的新方向，而非只靠更大模型。 |
| 00:09 - 03:47 | 回顧RNN的歷史與其訓練時面臨的梯度問題，並與LLM做對比。 |
| 03:47 - 07:34 | 闡述LLM在處理不可壓縮推理問題（如排序、數獨）時的限制。 |
| 07:34 - 11:12 | 詳細解釋分層推理模型（HRM）的遞迴架構與生物啟發。 |
| 11:12 - 14:18 | 揭示HRM如何透過深度平衡學習（DEQ）解決梯度問題，取得突破性成果。 |
| 14:18 - 16:17 | 探討機器學習中生物學啟發的優點與潛在誤區。 |

---

## 📖 詳細內容

### 01｜遞迴：AI 擴展的新方向

**核心觀點：** AI的發展不應該只聚焦在把模型做得越來越大。現在有一個更令人興奮的方向，那就是利用「遞迴」來提升模型的推理表現，特別是在推理階段，這是一個很有潛力的新擴展法則。

**重要原話：**
> "Specifically, we're going to talk about how we can improve a model's reasoning performance by using recursion at inference time rather than by just making the model bigger and bigger."
>
> （中文翻譯：具體來說，我們要討論的是如何在推理時利用遞迴來改善模型的推理表現，而不是只靠把模型做得越來越大。）

**個人感受：** 我聽了這段話感覺像是撥開了迷霧。過去幾年一直看到各種超大型模型的新聞，似乎AI的進化就等於「模型更大，參數更多」，但這影片一開始就點出了不一樣的路，讓我覺得很有意思，迫不及待想知道背後是什麼原理。

**延伸思考：** 這種不追求「大」而追求「巧」的思路，讓我想到自然界中許多看似簡單的結構卻能產生複雜行為的系統。AI的發展或許也該學習這種從結構或演算法層面優化，而非僅僅是資源堆砌。

**可參考的行動：** 當我們評估AI技術或產品時，可以多問一句：「除了規模，它還在哪些方面做了架構或演算法上的創新？」

---

### 02｜RNN 的崛起與困境

**核心觀點：** 循環神經網路（RNN）在Transformer出現前，曾被認為是實現通用人工智慧（AGI）的關鍵，它透過對自身進行重複呼叫來處理序列數據。然而，RNN在訓練時，由於「時間反向傳播」機制會導致梯度消失或梯度爆炸，並需要大量記憶體來儲存中間激活值，這大大限制了其處理長序列的能力。相較之下，現代大型語言模型（LLMs）的Transformer架構能「一次性」處理所有時間步的輸入，解決了這些梯度問題，但卻犧牲了RNN在時間方向上的「壓縮」能力和潛在推理優勢。

**重要原話：**
> "You have these like vanishing or exploding gradient problems... And even worse, you have to retain the activations at every single step."
>
> （中文翻譯：你會遇到梯度消失或梯度爆炸的問題……更糟的是，你必須在每個步驟都保留激活值。）
>
> "There is no compression in LM. Every single decode that I do, I still have to retain the entire, you know, Shakespeare novel just to like decode a little bit. And in RNNs, you don&#39;t have to do that. It&#39;s all compressed in this hidden state that you kind of roll out."
>
> （中文翻譯：大型語言模型沒有壓縮功能。我每次解碼，還是必須保留整部莎士比亞小說，只為了解碼一小段。但在RNN中，你不需要這樣做。它會全部壓縮在這種你展開的隱藏狀態中。）

**個人感受：** 看到RNN的歷史和它面臨的這些深層問題，我突然對深度學習領域的演進有了更清晰的認識。感覺就像技術發展總是在解決一個問題的同時，又創造出新的權衡。LLM解決了梯度問題，卻失去了RNN的某些優雅之處，這讓我思考工程和理論上的取捨。

**延伸思考：** 這段話讓我想到，任何技術都有其極限和最佳應用場景。LLM在生成式任務上表現亮眼，但在需要深度、序列性推理的場景下，或許需要不同的架構來補足。

**可參考的行動：** 如果我正在處理需要處理長序列或需要高度壓縮記憶體的任務，我會去研究除了Transformer之外，是否有其他如RNN變體或遞迴模型能提供更有效的解決方案。

---

### 03｜大型語言模型推理的盲點

**核心觀點：** 儘管大型語言模型（LLMs）在許多任務上表現驚人，但它們在處理一些「不可壓縮」的推理問題時，存在先天的限制。這類問題，例如排序演算法、數獨或迷宮，需要模型執行多個相互依賴的計算步驟。由於LLM在本質上是「一次性」的前向傳播模型，它們沒有足夠的「內部計算步驟」或「外部記憶體」來完成這些複雜的、像圖靈機一樣的迭代處理。即使像「思維鏈」（Chain-of-Thought）這種技術在推論時能提供幫助，那也只是在測試階段的「作弊」，而非模型在訓練時內建的推理能力。

**重要原話：**
> "it&#39;s actually impossible for the model to map from unsorted list to sorted lists if I have... in a one shot basis... It&#39;s not possible for me to like do all the steps that is needed to be done."
>
> （中文翻譯：如果我只有一次機會……模型實際上不可能將未排序的列表映射到已排序的列表……我無法完成所有必要的步驟。）
>
> "the cheat is the the chain of thought... at test time they are uh turn complete and you can simulate all turn computable functions at test time but how do you get it to learn it you need to train it"
>
> （中文翻譯：作弊的方法是思維鏈……在測試時，它們是圖靈完備的，你可以在測試時模擬所有圖靈可計算函數，但你如何讓它學習呢？你需要訓練它。）

**個人感受：** 影片中提到LLM無法在一次前向傳播中完成排序或數獨，這讓我蠻震驚的。我總以為這些模型既然能生成長文本、寫程式碼，應該也能輕鬆處理這類邏輯問題。原來，「一次性」的設計是把雙面刃，讓我對LLM的「推理」有了更清醒的認識，不能把它的模式匹配能力誤認為真正的深層推理。

**延伸思考：** 這點讓我想到，如果我們要讓AI解決更具挑戰性的科學、數學或工程問題，我們可能需要讓模型具備「內省」和「迭代修正」的能力，而不僅僅是給出單一、最終的答案。這可能需要將其與外部工具或更複雜的控制機制結合。

**可參考的行動：** 在使用大型語言模型解決複雜邏輯問題時，我會留意其輸出是否真的經過了多步驟的「推理」，而不是表面上的模式匹配，必要時會用更小的、專門的演算法模型來驗證結果。

---

### 04｜分層推理模型 (HRM) 的運作原理

**核心觀點：** 分層推理模型（HRM）借鑒了循環神經網路（RNN）的理念，並從人腦不同區域以不同頻率運作的生物學啟發中獲得靈感。它設計了三層遞迴結構：低層、高層和外部精煉步驟，每個層級都在執行類似於遞迴函數的操作，並共享相同的權重。這種設計讓模型能夠在不同抽象層次上反覆處理輸入（例如不完整的數獨或迷宮），透過這種層層遞進的精煉，逐步接近解決方案。

**重要原話：**
> "There's some that operate at a really high frequency which is on the low level of the hierarchy. Some that operate in a really a low frequency which is the the higher level of the hierarchy. And the interplay between those things is really interesting."
>
> （中文翻譯：有些以高頻率運作，位於層次結構的低層。有些則以低頻率運作，位於層次結構的高層。這些層次之間的相互作用非常有趣。）
>
> "there&#39;s exactly three levels of recursion occurring here. There&#39;s the low level, there&#39;s the high level and then there&#39;s the outer refinement steps."
>
> （中文翻譯：這裡精確地發生了三個層次的遞迴。有低層、高層，然後是外部精煉步驟。）

**個人感受：** HRM這種模擬人腦多頻率、分層處理資訊的方式，讓我覺得很聰明。把遞迴應用在不同抽象層次上，而不是單一維度，感覺上就更接近我們解決複雜問題的思維模式。尤其聽到它共享權重，這又進一步說明了「效率」在設計中被重視。

**延伸思考：** 這種多層次遞迴的概念，是否也能應用在其他需要逐步精煉或多視角分析的任務上，例如圖像生成中的細節疊代，或文本理解中的不同層次語義解析？

**可參考的行動：** 如果我在設計一個需要模型進行多步驟決策或層次化處理的AI系統，我會考慮引入這種多層次、共享權重的遞迴架構，看能否用更小的模型達到更好的效果。

---

### 05｜HRM 的訓練智慧：DEQ 的妙用

**核心觀點：** HRM解決了RNN在遞迴訓練時面臨的「時間反向傳播」問題，其關鍵在於採用了「深度平衡學習」（DEQ）方法。傳統RNN需要反向傳播整個遞迴序列，導致梯度消失和記憶體負擔。DEQ透過「定點迭代」策略，只對兩個模塊進行一次反向傳播，並在訓練過程中多次重複應用相同的輸入批次，每次都從前一次迭代的隱藏狀態（carry variable）繼續。這種方法避免了完全的回溯，利用隱藏狀態的變化作為不同「批次」的效果，在只有2700萬參數、且僅用1000個ARC挑戰數據訓練下，卻能超越GPT-3等大型模型，達到70%的SOTA成績。

**重要原話：**
> "instead of doing what Alex Graves did in all of his papers from neural touring machines to uh adaptive compute time um to differential neurocomputers is he always backropped through all of the recursion steps and he was limited by back through time."
>
> （中文翻譯：Alex Graves在他的所有論文中，從神經圖靈機到自適應計算時間再到差分神經電腦，他總是對所有遞迴步驟進行反向傳播，但他受限於時間反向傳播。）
>
> "What they do instead is they actually do that 16 times. And so and as you do that, you actually can see the change uh in your residuals get less and less and less."
>
> （中文翻譯：他們做的是，他們實際重複了16次。這樣做之後，你可以看到殘差的變化越來越小。）
>
> "this was a only a 27 million parameter model that was only trained on uh arc prize... literally a thousand task which is extremely small there is no pre-training at all... and it can outperform at that time if we go back you know we had um 03 ... and it got like something like 70% on arc prize one at least"
>
> （中文翻譯：這是一個只有2700萬參數的模型，只在ARC挑戰賽上進行了訓練……文字上只有一千個任務，數量非常少，完全沒有預訓練……它在當時能夠超越……GPT-3……在ARC挑戰賽第一階段至少取得了約70%的成績。）

**個人感受：** 我聽到HRM能用這麼小的模型和數據量，就打敗了大型模型在某些任務上的表現，真的讓我下巴都掉了。這簡直是AI領域的「以小搏大」！特別是他們解決時間反向傳播的方式，這種把同一個批次輸入重複處理、每次從上次隱藏狀態繼續的做法，像是變相創造了訓練數據的多樣性，非常巧妙。

**延伸思考：** 這項技術的突破性成果，證明了「如何訓練」與「模型大小」同樣重要，甚至可能更重要。它為AI效率和可持續發展開闢了新的路徑。如果能在更多場景下驗證這種訓練方法，將對整個產業產生巨大影響。

**可參考的行動：** 當我們設計或評估AI模型時，應該將注意力從單純的模型大小轉移到模型的架構設計、訓練策略以及如何有效利用遞迴或迭代上。

---

### 06｜生物啟發的兩面性

**核心觀點：** 機器學習領域經常從神經科學中尋求生物學上的啟發，因為人腦是一個極度高效且強大的計算工具。從神經網路的基本概念到特定的激活函數，許多設計都源於對生物大腦運作方式的類比。然而，這種啟發通常只是一個起點。研究人員常常會發現，雖然生物學原理能激發新點子，但最終證明最有效的方法，卻往往是那些在生物學上看似「不合理」或經過高度抽象簡化的變體。例如，AlexNet曾引入了生物學啟發的功能（如局部抑制），但後來VGG等模型證明，捨棄這些「生物真實性」而單純加深網路層次，反而能獲得更好的性能。

**重要原話：**
> "a lot of machine learning research has for a long time sought analog from how we think to understand our brain to work and try to encode that in various machine learning systems."
>
> （中文翻譯：長期以來，許多機器學習研究都試圖從我們理解大腦運作方式中尋找類比，並嘗試將其編碼到各種機器學習系統中。）
>
> "we end up veering away from the bioplausible to something adjacent to them that is likely bioimplausible, but that seems to work better."
>
> （中文翻譯：我們最終會偏離生物學上合理的想法，轉向那些可能在生物學上不合理，但似乎效果更好的相近事物。）

**個人感受：** 關於生物啟發的討論，我很能理解為什麼大家會去借鑒大腦，畢竟它是目前最複雜、最有效的「計算機」。但影片點出，我們常常「被啟發」後，最終卻發現效果最好的其實是「不那麼生物化」的版本，這蠻有趣的。感覺就像是從自然界獲取靈感，但為了工程實用性，還是得「改造」一番。

**延伸思考：** 這讓我思考，機器學習的目標是解決問題，而不一定是完美模擬生物系統。所以，在追求新技術時，應保持開放的心態，不要過於拘泥於是否「像」生物學，最終還是要以實際效果和效率為判斷標準。

**可參考的行動：** 當我看到一個宣稱受「生物啟發」的AI模型時，我會更仔細地去了解它實際工作原理中的哪些部分是來自生物啟發，哪些部分是為了工程效率而做的取捨或創新，並專注於其性能表現，而不是其故事性。

---

## 💎 精華收穫

這支影片讓我對AI的未來發展有了更清晰的認識：擴展AI能力不只一條路，不全然是追求「更大的模型」。透過引入「遞迴」和巧妙的訓練策略（如DEQ），即使是參數較小的模型，也能在複雜的推理任務上展現出超越大型模型的性能。這告訴我們，AI的智慧可能更多地來自於精巧的架構設計和迭代處理機制，而非單純的算力或數據堆疊，這為未來AI的發展指明了更高效、更具潛力的新方向。

---
*由 PotatoLearning Hub 自动生成*
