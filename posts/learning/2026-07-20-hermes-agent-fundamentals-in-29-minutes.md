---
title: '你有一台24小時運作的AI大腦嗎？29分鐘學會打造會成長的私人特助'
original_title: 'Hermes Agent Fundamentals In 29 Minutes'
author: 'tina_huang'
category: '科技趨勢'
date: "2026-07-20"
tags: ['科技趨勢', 'tina_huang']
source_url: "https://www.youtube.com/watch?v=5_N84t1rUU0"
thumbnail: "https://img.youtube.com/vi/5_N84t1rUU0/maxresdefault.jpg"
---

## 📋 Brief

這支影片是一份從零開始設定「Hermes Agent」的完整指南。作者手把手教你怎麼根據自己的硬體設備和預算，搭建一個能24小時幫你跑研究、管資訊、自動執行工作的AI特助。最大亮點是它能「學會」你教它的技能，越用越聰明。

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| 00:00 - 01:26 | 影片開場與大綱：為何正確設定你的AI特助是成敗關鍵 |
| 01:27 - 02:57 | 硬體選擇：從頂級 Mac Studio 到免費的現有電腦，四種方案比較 |
| 02:57 - 05:13 | 下載與基礎設定：桌面應用程式安裝、連結模型與首次互動 |
| 05:13 - 07:49 | 記憶系統解密：讓AI記住你是誰，以及它把記憶存在哪裡 |
| 07:50 - 10:50 | 核心功能一：內建工具與整合第三方軟體（如Discord） |
| 10:50 - 14:18 | 核心功能二：技能系統——教你的AI學習新本事，並自動儲存 |
| 14:18 - 15:00 | 核心功能三：定時任務（Cron Jobs）讓它自動化重複性工作 |

---

## 📖 詳細內容

### 01｜你的AI特助，從哪裡開始？

**核心觀點：** 這支影片的核心是「正確設定」。作者認為，設定得對，你的AI特助就能成為一個可持續擴展、日益強大的工作夥伴；設定不好，只會讓你體驗極差。他會分享自己用了四個多月的多代理系統，並提供具體的提示詞和工作流讓你直接抄。

**重要原話：**
> "Setting up your Hermes Agent correctly is so important. It's the difference between having a terrible time versus being able to build something sustainable that you can build on top of and become more magical every day."
>
> （原文：正確設定你的Hermes Agent太重要了。這決定了你會有一段糟糕的體驗，還是能建立一個可持續、不斷疊加、每天都能變得更神奇的東西。）

**個人感受：** 這段話直接點中要害。很多人玩AI工具半途而廢，很可能就是一開始沒搞好，覺得麻煩又沒效果，直接放棄了。他把這個準備工作形容成「魔法」的基礎，聽起來就很有動力想跟著做。

**延伸思考：** 不只是Hermes，任何強大的工具都需要正確的「初始化」。花時間把基礎打好，後面的效率提升是指數級的。

**可參考的行動：** 在看下一步之前，先問自己一個問題：我期望這個AI特助最幫我解決哪一件重複又耗時的事？把這個目標寫下來。

---

### 02｜硬體選擇：你的AI大腦住哪裡？

**核心觀點：** 運行AI模型需要算力。作者提供了四種選擇：1）專用強力主機（如Mac Studio），2）雲端虛擬伺服器（VPS，每月幾美元），3）閒置的舊電腦或筆電（他就是從這裡開始），4）你正在用的個人電腦（但強烈建議用Docker隔離）。

**重要原話：**
> "You can also have very powerful Hermes Agent setups with other options... The third option is just to use any old computer or laptop that you happen to have around... This is actually where I started."
>
> （原文：你也可以用其他選項搭建非常強大的Hermes Agent...第三個選項就是用你手邊任何閒置的舊電腦或筆電...這其實就是我的起點。）

**個人感受：** 這點很實際。不是每個人都有錢買高配設備。聽到他是從16GB RAM的舊MacBook Pro開始的，感覺親切多了，降低了開始的門檻。用Docker隔離保護個人電腦的提醒也很貼心。

**延伸思考：** 技術民主化就體現在這裡。強大的AI能力不再只屬於有錢人，而是可以「租」（VPS）或「利用」（舊設備）的。

**可參考的行動：** 檢查一下你家裡有沒有閒置的筆電或電腦（RAM至少8GB）。如果有，下一步就是查一下怎麼用Docker。

---

### 03｜記憶系統：讓AI真正「認得」你

**核心觀點：** 設定好後，第一件事是「自我介紹」。作者建議可以從另一個聊天機器人（如Claude）那裡複製一份關於你自己的描述貼給Hermes。Hermes會把這些資訊存成一個人類可讀的Markdown檔案在你的電腦裡，這是它記憶的基礎。

**重要原話：**
> "You can literally see everything that's contained here... This is literally like human readable. You can read it yourself what Hermes knows about you."
>
> （原文：你真的可以看到這裡面的所有內容...這完全是人類可讀的。你自己就能讀出Hermes知道關於你的哪些事。）

**個人感受：** 看到記憶以文字檔案形式存在自己的電腦裡，有一種踏實感和掌控感。不像有些AI的記憶是黑箱，你可以隨時去檢視甚至手動修改它對你的認識。

**延伸思考：** 這其實是在和AI建立一種「結構化關係」。你提供清晰的上下文，它就能提供更個人化的服務。這份「用戶檔案」會是未來所有AI助理的標配嗎？

**可參考的行動：** 打開你的筆記軟體，寫下三件你希望AI特助最了解你的事（例如：你的職業、你的工作風格、你最常需要處理的文件類型）。

---

### 04｜技能系統：教你自己的AI「新才藝」

**核心觀點：** 這是Hermes的招牌功能。它能隨著合作，學會新的技能（本質是一套完成任務的指令手冊）。你可以在工作中直接「教」它，例如完成一次商業點子評估後，要求它「把這個流程變成一個技能」，下次就能用斜線命令快速調用。

**重要原話：**
> "Make this into a skill for evaluating business ideas... And it was able to make this skill... Now I have that skill available to me and I can do /business-idea-evaluator."
>
> （原文：「把這個變成一個評估商業點子的技能」...它成功創造了這個技能...現在我有這個技能可以用了，我可以輸入 /business-idea-evaluator 來調用它。）

**個人感受：** 這功能太有想像空間了。等於你在創造一個只屬於你的、會成長的軟體庫。從「用戶」變成了「共同創造者」，那種感覺很不一樣。

**延伸思考：** 未來的競爭力，可能不是你會不會用AI，而是你能不能為自己或自己的領域，「煉製」出一整套獨特的AI技能包。

**可參考的行動：** 回想你上周做過的一件重複性文書工作（例如：整理會議紀錄、撰寫特定格式的報告）。下次做的時候，嘗試一步步讓AI跟著你做，完成後命令它：「將剛才的步驟保存為一個名為『XXX』的技能。」

---

### 05｜定時任務與整合：讓它主動幫你工作

**核心觀點：** 透過「定時任務」（Cron Jobs），你可以讓AI在固定時間自動執行工作，比如每天早上11點跑一份AI簡報。而透過「整合」（Integrations），你能把Hermes連接到Discord、Telegram等平台，讓它能直接在這些地方跟你互動、發送通知。

**重要原話：**
> "A cron job is a scheduled task that runs automatically at certain times or specific intervals without having to manually trigger it... I have daily scheduled brief that I have at 11."
>
> （原文：定時任務是一種排程任務，能在特定時間或間隔自動運行，不需要手動觸發...我有每天早上11點的排程簡報。）

**個人感受：** 這才是從「聊天機器人」到「私人特助」的跨越。當它開始主動按時幫你做事、把結果推到你手機上的時候，你會真切感覺到有個夥伴在幫你分擔工作量。

**延伸思考：** 這模糊了軟體與員工的界線。設定好規則和整合後，AI就成了你團隊裡一個不會請假、持續運作的數位成員。

**可參考的行動：** 打開你的通訊軟體（如Discord），建立一個專屬頻道，名字就叫「AI簡報」。這是你未來接收AI自動報告的第一步。

---

## 💎 精華收穫

這支影片最大的價值，是把一個看似複雜的「搭建AI特助」工程，拆解成從選硬體、裝軟體、教記憶、學技能到設定自動化的清晰步驟。它不僅給你工具，更給了一個思路：別把AI當成一次性的聊天對象，而是投入時間與它共同成長，打造一個真正理解你、能幫你處理具體事務的長期合作夥伴。

---
*由 PotatoLearning Hub 自动生成*
