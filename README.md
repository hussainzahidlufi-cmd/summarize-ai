# SummarizeAI - Video & Audio Intelligence 🎙️📹

> **AI-Powered Multimedia Summarization, Full Verbatim Voice-Over Transcription, and Video-to-Text Study Notes Engine**  
> *Built with React 19, TypeScript, Tailwind CSS, Express, Google Gemini 3.8 Flash, and Google Drive Cloud Sync.*

---

## 📖 Application Description (Overview)

**SummarizeAI** is a production-grade multimedia intelligence platform designed for students, educators, content creators, and traders (especially Forex & Crypto Smart Money Concepts - SMC). It ingests video and audio content from YouTube, local file uploads (MP4, MKV, MP3, WAV), live microphone recordings, and direct Google Drive cloud files to generate:

1. **Word-for-Word (Verbatim) Speech-to-Text Transcriptions** with segmented dialogue timestamps (`[00:00 - 02:30]`).
2. **High-Yield Video-to-Text Study Notes** structured into core concepts, execution rules, key formulas, and self-assessment quizzes.
3. **Roman Urdu Intelligence** by default (with instant switching to Nastaliq Urdu or English), keeping technical and financial terminology crystal clear.

---

## 🌟 Key Features

### 1. 🎙️ Full Verbatim Speech-to-Text with Timestamps
- Automatically transcribes speech segment-by-segment with synchronized start and end timestamps.
- Searchable continuous dialogue viewer with 1-click phrase copy.
- Dedicated download actions for `.TXT` and `.MD` transcript files.

### 2. 📚 Video-to-Text Study Notes & Cheat-sheets
- Generates structured, actionable study summaries.
- Pre-configured presets for **Forex Dada SMC** (Order Blocks, Fair Value Gaps, Liquidity Sweeps, BOS/CHoCH, Multi-Timeframe Analysis).
- Interactive quiz and knowledge-check questions with expandable answers.

### 3. 👥 Side-by-Side Dual View ("View Transcript" Toggle)
- Open summary notes and raw verbatim transcripts side-by-side in a responsive two-column layout for easy verification.

### 4. ☁️ Google Drive Cloud Integration
- **1-Click Save**: Export Study Notes (`.md`) and Raw Transcripts (`.txt`) directly to your Google Drive inside the `SummarizeAI Notes & Transcripts` folder.
- **Cloud Media Ingestion**: Connect your Google Drive and import stored video or audio files directly into the summarizer without consuming local disk space.
- **In-App Drive Explorer**: Browse your cloud files with direct Google Drive web links.

### 5. 🗣️ Native Roman Urdu & Multilingual Engine
- Conversational Pakistani/Hindustani Roman Urdu optimized for natural clarity while preserving professional, scientific, and trading terminology.
- Switch between **Roman Urdu**, **Urdu (نستعلیق)**, and **English** at any time.

### 6. 🔊 Audio Narration (TTS)
- Listen to executive summaries spoken aloud via `gemini-3.8-flash-lite-tts`.

### 7. 💬 Interactive Q&A Chat
- Ask follow-up questions directly to the video context in real time (e.g., *"Is video mein recommended stop loss kahan tha?"*).

---

## 🚀 How to Use (Kaise Use Karein)

Follow these 5 simple steps to process any video or audio:

1. **Select Your Input Source**:
   - **YouTube Link**: Paste any YouTube video URL.
   - **Upload File**: Drop an MP4, MKV, WebM, MP3, WAV, or M4A file from your computer.
   - **Google Drive**: Pick an audio or video file directly from your connected Google Drive.
   - **Live Voice Record**: Use your device's microphone to record lectures or voice notes in real time.
   - **Paste Transcript**: Paste existing subtitles or raw text.

2. **Choose Language & Summary Mode**:
   - Language defaults to **Roman Urdu** (or select **Urdu** / **English**).
   - Select your desired depth: *Detailed Study Notes*, *Executive Summary*, *Bullet Points*, or *Forex SMC Rules*.

3. **Click "Summarize & Transcribe"**:
   - In seconds, the engine processes the media and streams the formatted output.

4. **Review, Compare & Save**:
   - Click **"View Transcript"** to view the full word-for-word transcript side-by-side.
   - Click **"Save to Google Drive"** for instant 1-click cloud backup.
   - Click **Download** for local `.TXT` and `.MD` files.
   - Click the **Speaker icon** to hear the audio narration.

5. **Ask Follow-up Questions**:
   - Scroll down to the **Interactive Chat** to query specific details from the video.

---

## 💻 How to Setup Locally (Local Installation Guide)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x LTS recommended)
- `npm` or `bun`
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone <YOUR-GITHUB-REPO-URL>
cd summarize-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
> 💡 **Free Quota**: Get your free API key at [Google AI Studio](https://aistudio.google.com/app/apikey). The free tier grants **1,500 free requests per day**, which covers 40–50 full video summaries daily at zero cost.

### 4. Start the Application
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🐙 How to Publish to GitHub (Git Guide)

To upload this project to your GitHub account:

### Step 1: Create a New GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Enter repository name: `summarize-ai` (or any name you prefer).
3. Choose **Public** or **Private**.
4. **Do NOT** check "Add a README file" (this project already includes comprehensive documentation).
5. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Open your terminal in the project directory and run:
```bash
# Add your GitHub repository as the remote origin
git remote add origin https://github.com/<YOUR-USERNAME>/summarize-ai.git

# Ensure the main branch is selected
git branch -M main

# Push all files to GitHub
git push -u origin main
```

---

## ⚡ 100% Free & Unlimited Offline Option (Python Desktop Script)

For users who want an unlimited, 100% offline desktop tool with no internet connection and no API keys:

### Architecture
- **Speech-to-Text**: [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper) (runs locally on CPU/GPU).
- **Summarizer**: [Ollama](https://ollama.com/) running **Llama 3** locally.

### Setup Instructions
1. Install [Ollama](https://ollama.com) and pull Llama 3:
   ```bash
   ollama run llama3
   ```
2. **Python Compatibility Note**: Use **Python 3.10, 3.11, or 3.12**. *(Note: Python 3.15 is experimental and does not yet have prebuilt wheels for `av`, causing compile errors).*
3. Install Python dependencies:
   ```bash
   py -3.11 -m pip install faster-whisper yt-dlp ollama
   ```
4. Copy the `unlimited_offline.py` script provided directly inside the app's **"Guide & Setup"** tab and run:
   ```bash
   python unlimited_offline.py
   ```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide React, Motion |
| **Backend** | Node.js, Express, tsx |
| **AI Intelligence** | Google Gemini 3.8 Flash (`gemini-3.8-flash`), Gemini 3.8 Flash Lite TTS |
| **Cloud Services** | Google Drive REST API v3, Firebase Auth |
| **Build Tooling** | Vite 8, ESBuild |

---

## 📄 License

MIT License. Free for personal, educational, and commercial use.
