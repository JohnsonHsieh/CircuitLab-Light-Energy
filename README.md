# 小小科學家：電路模擬實驗室 (Little Scientist: Circuit Lab)

這是一個專為國小自然科學課程（電池與燈泡單元）設計的互動式學習工具。透過直觀的模擬與 AI 輔助，讓抽象的電學原理變得易於觀察與理解。

## 📸 介面預覽

為了讓使用者快速了解系統功能，以下是電路模擬器的核心介面：

| 1. 互動式電路模擬台 | 2. 進階科學公式教室 | 3. 智慧測驗與錯題本 |
| :---: | :---: | :---: |
| ![電路模擬主介面](./screenshots/main_ui.png) | ![電力公式運算](./screenshots/formulas.png) | ![測驗與錯題紀錄](./screenshots/quiz_book.png) |
| *直觀的組件配置與即時亮度反應* | *深入淺出的歐姆定律與功率計算* | *自動收錄弱點，鞏固科學知識* |

> **提示**：建議將您提供的三張截圖存放於專案根目錄的 `screenshots/` 資料夾下，並分別命名為 `main_ui.png`, `formulas.png`, `quiz_book.png` 以確保圖片正常顯示。

## 🌟 核心特色

### 1. 擬真電路模擬
- **電池配置**：支援 1-10 顆電池的串聯與並聯，觀察電壓推力的變化。
- **負載多樣化**：
  - **一般燈泡**：模擬鎢絲熱發光，亮度隨電壓平方增長，絲極顏色會隨溫度動態改變。
  - **LED 燈泡**：支援五種顏色，模擬「導通電壓 (Vf)」特性，體現現代節能照明原理。
- **變壓器系統**：進階功能，讓學生理解電壓變動對耗電量的「平方級」影響。

### 2. 智慧教學互動
- **AI 老師解說**：整合 Gemini API，針對實驗現況提供生動的比喻與原理解釋。
- **觀察小提醒**：實時偵測電路狀態（如：斷路、過載、低壓不亮），提供即時的觀察引導。

### 3. 測驗與學習紀錄
- **智慧題庫**：從 50 題專業題庫中隨機抽選，確保每次學習都有新發現。
- **科學家錯題本**：
  - 自動收錄答錯題目並提供「複習重點」。
  - 支援 `localStorage` 持久化，即使重啟瀏覽器紀錄依然存在。
  - 支援自主移除功能，學會後即可點擊「我學會了」清理紀錄。

## 🚀 佈署到 GitHub Pages

本專案已配置好 GitHub Actions，您可以輕鬆完成自動化佈署：

### 第一步：設定 GitHub Secrets
1. 前往您的 GitHub Repository 頁面。
2. 點擊 **Settings** > **Secrets and variables** > **Actions**。
3. 點擊 **New repository secret**。
4. **Name** 輸入：`GEMINI_API_KEY`。
5. **Value** 輸入：您的 Google Gemini API Key。

### 第二步：推送程式碼
將程式碼推送到 `main` 分支後，Actions 會自動觸發構建：
```bash
git add .
git commit -m "Update README with screenshots"
git push origin main
```

### 第三步：啟用 GitHub Pages
1. 前往 **Settings** > **Pages**。
2. 在 **Build and deployment** > **Branch**，選擇 `gh-pages` 分支並儲存。

## 🛠️ 開發與安裝 (本地運行)

### 1. 複製專案
```bash
git clone [repository-url]
cd [project-directory]
```

### 2. 環境配置
本應用程式需要 Google Gemini API Key。本地測試時可於 `.env` 檔案中加入 `API_KEY=您的金鑰`。

### 3. 啟動伺服器
```bash
npm install
npm run dev
```

## 🎓 適合對象
- **國小中高年級學生**：探索自然科學電學單元。
- **自然科老師**：作為課堂演示或學生自主學習工具。
- **家長**：與孩子一同進行安全且有趣的電力實驗。

---
*安全聲明：本軟體僅供模擬教學使用，真實電路實驗請務必在大人指導下使用合格器材進行。*