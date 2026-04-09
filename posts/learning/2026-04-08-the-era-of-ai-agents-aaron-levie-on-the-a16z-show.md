---
title: "當 AI Agent 成為軟體的主要用戶：Box CEO Aaron Levie 的企業軟體預言"
original_title: "The Era of AI Agents | Aaron Levie on The a16z Show"
author: "a16z"
category: "科技趨勢"
date: "2026-04-08"
tags: ["科技趨勢", "a16z", "AI", "企業軟體", "Agent"]
source_url: "https://www.youtube.com/watch?v=dvt_74kV-RM"
thumbnail: "https://img.youtube.com/vi/dvt_74kV-RM/maxresdefault.jpg"
---

## 📋 Brief

Box CEO Aaron Levie 和 a16z 的 Erik Torenberg、Steven Sinofsky、Martin Casado 坐在一起，聊了一個很實際的問題：當一家公司的 agent 數量是人類員工的一百倍，軟體該怎麼設計？話題從「寫程式的 agent 為什麼比其他 agent 成功」一路聊到「要不要給你的 agent 一張獨立信用卡」，中間穿插了試算表普及的歷史類比和 CFO 們的恐慌。整場對話的底色是：這件事沒有矽谷想的那麼快，但方向已經定了。

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| 00:00 - 02:10 | 開場：軟體要為 agent 而建，不是為人類 — agent 數量將是人類的百倍甚至千倍 |
| 02:10 - 05:00 | 演算法思維很難：大多數人連自己工作的流程圖都畫不出來，更別說指揮 agent |
| 05:00 - 08:30 | 歷史類比：從 HP 計算器到試算表，技術普及永遠需要時間，但最終整個抽象層會上升 |
| 08:30 - 11:00 | 程式碼 → 終端 → 電腦操作：agent 使用軟體的方式正在從寫程式退化到更像人類操作 |
| 11:00 - 15:30 | 即時整合：agent 能在執行當下把兩個從未連接的系統串起來，CFO 聽了很緊張 |
| 15:30 - 18:40 | Box CLI 實戰：用 Claude Code 操作 Box 的興奮與混亂，以及「給 agent 自己的信用卡」這個務實方案 |

---

## 📖 詳細內容

### 01｜軟體的第一用戶正在變成 agent

**核心觀點：** Aaron 說 Box 現在花在「agent 介面」上的時間已經跟「人類介面」一樣多了。原因很簡單：如果 agent 的數量是人類的 100 倍甚至 1000 倍，那軟體當然要優先服務 agent。但 Aaron 馬上潑了冷水，他說「vibe code your way to SAP」是荒謬的，SAP 背後幾十年的產業知識不是一個漂亮的資料層就能替代的。

**重要原話：**
> 「現在大家抽象地說什麼『你要對 agent 行銷，你要有好的 API』，我覺得這幾乎是完全錯的。」
>
> （原文："People in the abstract say things like, 'Now you're marketing to agents that you're like an API. You've got a good IDL.' I actually think that's almost exactly wrong."）

**個人感受：** 「把軟體做好給 agent 用」這句話聽起來很合理，但 Aaron 說 API first 是錯的時候我愣了一下。他的意思是 agent 最終會像人一樣直接操作 UI，而不是走後門 API。這跟我之前的直覺完全相反。

**延伸思考：** 如果 agent 真的變成軟體的主要用戶，那 SaaS 公司的護城河會怎麼變？現在靠 UI 鎖住用戶的公司，可能反而比 API-first 的公司更安全，因為 agent 操作 UI 的能力在快速進步。

**可參考的行動：** 打開你公司用的主要工具，問自己一個問題：如果明天要讓一個 AI agent 接手我 80% 的操作，這個工具的設計是幫助還是阻礙？記下三個最大的摩擦點。

---

### 02｜大多數人畫不出自己工作的流程圖

**核心觀點：** Steven Sinofsky 拋出了一個不舒服的事實：你隨便找一個人，讓他把日常工作畫成流程圖，大部分人會失敗。一個 50 人的行銷團隊裡，可能只有一個人能完整描述整個流程。所以就算你把最強的 co-working agent 放在他們面前，他們也不知道該怎麼指揮它。

**重要原話：**
> 「演算法思維對絕大多數有工作的人來說，是非常非常困難的。」
>
> （原文："Algorithmic thinking is really really really hard for the vast majority of people who have jobs."）

**個人感受：** 這句話刺了一下。我回頭想想自己，確實很多時候做事靠直覺和經驗，要我把步驟一五一十拆解清楚，有時候也會卡住。這不是智商問題，是思維方式的問題。

**延伸思考：** 這解釋了為什麼 coding agent 第一個成功：寫程式本身就是一種演算法思維，工程師本來就在做「畫流程圖」這件事。但行銷、人資、財務的人沒受過這個訓練。agent 想要真正普及到非技術崗位，可能得先幫用戶把隱性知識變成顯性知識。

**可參考的行動：** 今天試一個練習：挑一件你每週都做的重複性工作，花 15 分鐘把每個步驟寫下來，精確到「點哪個按鈕、輸入什麼文字」。你會發現比想像中難，但這個練習本身就是未來指揮 agent 的基本功。

---

### 03｜試算表的歷史告訴我們什麼

**核心觀點：** Sinofsky 講了他表妹的故事。MBA 畢業進銀行，完全不會用試算表，公司讓她帶一群實習生幫她做表格。兩年後，她和同梯全都變成了試算表高手。他認為 agent 現在就處於「需要一群實習生幫忙」的過渡期，但很快那些「實習生」會內化成一種普遍技能。

**重要原話：**
> 「現在你要像火箭科學家一樣才能架出 42 個 agent 來做行銷自動化。但火箭科學那部分很快就會蒸發掉。」
>
> （原文："Right now you have to be a rocket scientist and the growth marketing person to create 42 agents and spin them all up. But the rocket science part of it just is going to evaporate in very short order."）

**個人感受：** 這個類比讓我安心了不少。我現在用 agent 的感覺確實像那個剛進銀行不會用 Excel 的人，到處找人幫忙，但心裡知道兩年後這些都會變成基本技能。問題是，兩年能不能等？

**延伸思考：** 每一次抽象層的提升，都會消滅一批舊崗位，同時創造一批新技能的需求。關鍵不是「agent 會不會取代我」，而是「我能多快從用實習生的人變成自己用試算表的人」。

**可參考的行動：** 每週花一小時用 agent（Claude Code、Cursor、或任何你順手的工具）做一件你以前手動做的事。不需要一次到位，先讓自己習慣這種工作方式。累積三個月再回頭看，你會發現差距拉開了。

---

### 04｜從寫程式到「用電腦」：agent 的演化方向

**核心觀點：** Martin Casado 指出一個反直覺的趨勢：大家以為 agent 會越來越依賴寫程式，但其實正在反過來。先是寫程式，然後退化到用終端機（其實是更少的程式碼），現在 2026 年是「computer use」年，agent 直接像人一樣操作軟體介面。Aaron 補充說 Box 的 agent 能在「用現有功能」「呼叫 API」「當場寫一段程式碼」三個選項之間動態選擇，其中當場寫程式碼的能力雖然只佔 10% 的場景，卻解決了不可能提前預測的需求。

**重要原話：**
> 「我們從程式碼開始，然後退到終端機，現在是 computer use。它們更像人類在使用電腦，而不是在生成程式碼。」
>
> （原文："We started with code, then we went to the terminal which is actually less code. And now this year is going to be the year of computer use. They're much more like humans using computers than generating code."）

**個人感受：** 我之前一直覺得「computer use」是個笨方案，像是退而求其次。但 Casado 的觀點讓我重新想了想：也許 agent 直接操作 UI 才是最自然的路，因為大多數軟體本來就是為人類設計的。繞過 UI 去寫程式碼反而是更不自然的方式。

**延伸思考：** 如果 agent 操作 UI 的能力越來越強，那所有「No-Code」工具的價值主張都需要重新評估。因為 agent 不需要你的可視化拖拽介面，它可以直接操作底層軟體。

**可參考的行動：** 下次你花時間寫腳本或用 API 自動化某個流程時，先問一下自己：如果 agent 能直接操作那個軟體的介面，我還需要這個腳本嗎？把這個問題當成一個思維訓練，開始分辨哪些自動化是「結構性的」，哪些只是「介面不好用」的產物。

---

### 05｜即時整合：CFO 們的噩夢與機會

**核心觀點：** Aaron 認為 agent 最厲害的能力之一是「即時整合」，意思是 agent 能在你需要的瞬間把兩個從未連接的系統串起來，而不是等 IT 團隊花三個月做整合。Sinofsky 說他跟一群 CFO 和 CIO 講這件事，六個人跑來說他「瘋了，已經失去可信度了」。他們的恐懼不是 agent 本身，而是「放人類隨便做整合」這件事，因為隨便連 system 27 和 system 38 可能搞壞整套系統。

**重要原話：**
> 「他們怕的不是 agent 本身，而是讓人類隨便做整合。你讓人去建新的 API，等於是說『請搞壞我的系統吧』。」
>
> （原文："Their fear is like unleashing not just the agents themselves but humans to do integration because you put people creating new integrations and you just say please break my system of record."）

**個人感受：** 我能理解那些 CFO 的反應。在一個跑了 20 年 SAP 的公司裡，突然有人說「讓 agent 即時串接你的系統」，這跟說「讓實習生直接改你的 ERP」差不多可怕。但 Aaron 的回應也對：先從唯讀開始，先把資料查詢做好，寫入和修改慢慢來。

**延伸思考：** 企業軟體的世界有兩種：一種是「system of record」（記錄系統，不能亂動），一種是「consumption layer」（消費層，隨便玩）。agent 會先從後者突破，前者會有很長的過渡期。這也意味著，做企業資料查詢和分析的工具可能比做企業流程自動化的工具更快被 agent 顛覆。

**可參考的行動：** 盤點你公司裡有哪些系統是「絕對不能亂動」的，有哪些是「查詢無所謂」的。對後者，下週試著用 agent 做一次跨系統的資料查詢，體驗一下即時整合的能力邊界在哪裡。

---

### 06｜給你的 agent 一張信用卡

**核心觀點：** Aaron 描述了 Box 推出 CLI 後的真實場景：5000 人的公司每個人都用 Claude Code 操作 Box，一小時可能打 10000 次請求，檔案被搬來搬去，有人正在寫入的時候另一個 agent 在刪除。Sinofsky 分享了他的解法：給 agent 自己的電話號碼、自己的 Gmail 帳號、自己的信用卡。與其建一整套新的權限管理系統，不如直接把 agent 當成一個新人類來管理。

**重要原話：**
> 「你不需要建另一套權限管理。你只需要把它當成一個獨立的人類來對待。」
>
> （原文："You have to treat it like a human, as a separate human, and then instead of building another auth layer."）

**個人感受：** 這個解法粗糙到有點好笑，但想想又很合理。Gmail 本身就有完整的權限管理系統，企業的 AD/LDAP 也早就成熟了。為什麼要重新發明輪子？直接把 agent 當新員工入職，現有的所有管理機制都能用。

**延伸思考：** 這暗示了一個更大的趨勢：未來公司的人力資源系統可能要管理的不只是人類員工，還有 agent 員工。每個 agent 有自己的帳號、權限、甚至預算。「AI 原生」的企業可能不是從零建系統，而是把現有的身份管理框架直接延伸到 agent 身上。

**可參考的行動：** 如果你現在在用 agent 工具（Claude Code、Cursor 等），試試建立一個獨立的工作帳號給它，而不是用你自己的主帳號。觀察這個簡單的改變怎麼影響你的風險管理和權限控制思維。

---

## 💎 精華收穫

這場對話最值得帶走的是一個務實的框架：agent 的普及不會是一次性的革命，而是一層一層的抽象提升，就像當年從計算器到試算表、從命令列到圖形介面。現在的 agent 還處在「你需要是火箭科學家才能用好」的階段，但這個門檻正在快速降低。對企業來說，最安全的切入點是從唯讀的資料查詢和跨系統整合開始；對個人來說，最重要的是現在就開始練習把隱性知識變成顯性流程，因為這是指揮 agent 的基本功。至於管理混亂的方法，可能比你想的更簡單：給 agent 一個獨立身份，用現有的制度管它。
