import React, { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Sparkles,
  BookOpen,
  Layers,
  Zap,
  ShieldCheck,
  HardDrive,
  Infinity,
  GitBranch,
  Github,
  Play,
  FileText,
  CheckCircle2,
  Cloud,
  ArrowRight,
  Settings,
  HelpCircle,
  Download,
  Volume2,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  const [activeGuideTab, setActiveGuideTab] = useState<'overview' | 'how-to-use' | 'local-setup' | 'github-publish' | 'offline-engine'>('overview');
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedOffline, setCopiedOffline] = useState(false);
  const [copiedGitCmds, setCopiedGitCmds] = useState(false);
  const [copiedNpmCmds, setCopiedNpmCmds] = useState(false);

  const gitPushCommands = `# 1. Open your terminal in project folder
# 2. Add your GitHub remote repository (replace with your repo URL):
git remote add origin https://github.com/<YOUR-USERNAME>/summarize-ai.git

# 3. Rename branch to main (if not already):
git branch -M main

# 4. Push all code to GitHub:
git push -u origin main`;

  const npmSetupCommands = `# 1. Clone repository
git clone https://github.com/<YOUR-USERNAME>/summarize-ai.git
cd summarize-ai

# 2. Install all dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Add your free Google Gemini API key inside .env
# GEMINI_API_KEY="your-free-gemini-api-key"

# 5. Start development server (Port 3000)
npm run dev`;

  const pythonGeminiCode = `import google.generativeai as genai
import yt_dlp
import os, time

# Google Gemini API Setup (gemini-3.8-flash - Free Tier)
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
genai.configure(api_key=GEMINI_API_KEY)

def summarize_media(file_path):
    print("⏳ Media file Gemini AI par upload ho rahi hai...")
    media_file = genai.upload_file(file_path)
    
    while media_file.state.name == "PROCESSING":
        time.sleep(4)
        media_file = genai.get_file(media_file.name)
        
    model = genai.GenerativeModel("models/gemini-3.8-flash")
    prompt = """
    Is video/audio ko shuru se aakhir tak sunein aur Roman Urdu mein:
    1. Overall Maqsad / Summary
    2. Ahem Points & Trading Rules (Bullet points)
    3. Lafz-ba-lafz transcript ke main points
    """
    response = model.generate_content([media_file, prompt])
    return response.text
`;

  const python100PercentOfflineCode = `import os
from faster_whisper import WhisperModel
import ollama
import yt_dlp

# ==============================================================================
# 100% FREE & UNLIMITED OFFLINE SUMMARIZER & TRANSCRIBER (No API, No Limits)
# 
# IMPORTANT NOTE FOR WINDOWS USERS:
# Use Python 3.10, 3.11, or 3.12 (Python 3.15 experimental version lacks prebuilt wheels).
# Setup steps:
# 1) Download & install Ollama: https://ollama.com
#    In CMD: ollama run llama3
# 2) Install pip libraries:
#    py -3.11 -m pip install faster-whisper yt-dlp ollama
# ==============================================================================

def get_audio(source):
    if source.startswith("http://") or source.startswith("https://"):
        print("⏳ YouTube audio download ho rahi hai...")
        ydl_opts = {'format': 'ba/b', 'outtmpl': 'temp_offline.%(ext)s'}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(source, download=True)
            return ydl.prepare_filename(info)
    return source

def transcribe_local_unlimited(audio_path):
    print("⏳ Faster-Whisper bina internet ke text bana raha hai (100% Offline)...")
    # 'base' model fast aur free hai CPU ke liye
    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_path, beam_size=5)
    
    transcript_lines = []
    for s in segments:
        line = f"[{s.start:.1f}s -> {s.end:.1f}s] {s.text}"
        print(line)
        transcript_lines.append(line)
    return "\\n".join(transcript_lines)

def summarize_local_unlimited(text):
    print("\\n🤖 Local Llama-3 Roman Urdu summary bana raha hai...")
    prompt = f"""
    Aap ek expert tutor hain. Neeche diye gaye transcript ko Roman Urdu mein summarize karein:
    1. Overall Topic
    2. Ahem Points & Rules (Bullet points)
    3. Actionable Conclusion
    
    Transcript:
    {text[:8000]}
    """
    res = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
    return res['message']['content']

if __name__ == "__main__":
    inp = input("Video path ya YouTube link enter karein: ").strip().replace('"', '')
    if inp:
        audio = get_audio(inp)
        transcript = transcribe_local_unlimited(audio)
        with open("unlimited_transcript.txt", "w", encoding="utf-8") as f:
            f.write(transcript)
        print("\\n✅ Transcript 'unlimited_transcript.txt' mein save ho gaya!")
        summary = summarize_local_unlimited(transcript)
        print("\\n" + "="*30 + " SUMMARY " + "="*30)
        print(summary)
`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-8 space-y-6 shadow-sm">
      {/* Top Banner: Free & Unlimited Architecture */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
              <span>SummarizeAI Documentation & Setup Center</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Free Tier Ready
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
              Mukammal user manual, feature details, local installation, GitHub publishing guide aur 100% free offline script.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-800 border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            1,500 Free Runs / Day
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveGuideTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Description & Features</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('how-to-use')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'how-to-use'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Kaise Use Karein (How to Use)</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('local-setup')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'local-setup'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Local Setup Guide</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('github-publish')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'github-publish'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>Git & GitHub Guide</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('offline-engine')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeGuideTab === 'offline-engine'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>100% Free Offline (Python)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & FEATURES */}
      {activeGuideTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              📌 Application Description (Overview)
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>SummarizeAI</strong> ek ultra-fast AI-powered multimedia summarization, full voice-over speech-to-text transcription aur study notes engine hai. Yeh application vishesh roop se students, traders (Forex/Crypto SMC - Smart Money Concepts), aur content creators ke liye banai gayi hai jo lambi videos (YouTube, lectures, podcasts, webinars) ko chand seconds mein Roman Urdu, Urdu ya English mein summarize aur transcribe karna chahte hain.
            </p>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            ✨ Key Features Matrix (Tamam Khusoosiyat)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">1. Lafz-ba-Lafz Full Transcript</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Video ya audio ka ek ek jumla timestamps ke sath nikaalta hai (`[00:00 - 02:30]`). Is mein real-time search aur copy buttons shamil hain.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">2. Side-by-Side Dual View</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aap summary aur full transcript ko ek sath 2-column layout mein baghal mein khol kar compare aur study kar sakte hain.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">3. Google Drive Cloud Sync</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google account se sign-in karke 1-click mein study notes aur transcripts apne Google Drive mein auto-save karein, ya Drive se direct video pick karein.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">4. Roman Urdu Default Language</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Natural Pakistani/Hindustani Roman Urdu zuban mein aasan samjh aane wali summary, jabke trading terms (Order Block, FVG, BOS) bilkul intact rehti hain.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Volume2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">5. Audio TTS Narration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini 3.8 Flash Lite TTS ke zariye notes ko bol kar sunein. Agar aap parh nahi sakte to earphone lagayein aur summary sun lein!
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">6. Interactive Q&A Chat</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Summary aane ke baad AI se us video ke mutalliq mazeed sawal puchein: "Is video mein entry point kya tha?", "Stop loss kahan lagana hai?" waghera.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOW TO USE */}
      {activeGuideTab === 'how-to-use' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm">
            <strong>Tareeqa-e-Istemal:</strong> SummarizeAI ko use karna nihayat aasan hai. Neeche diye gaye 5 aasan steps follow karein:
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Source Select Karein (Input Option)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Workspace par jayein aur apna pasandeeda tareeqa chunein:
                </p>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pt-1">
                  <li><strong>YouTube Video:</strong> Kisi bhi YouTube video ka link copy karke paste karein.</li>
                  <li><strong>Upload File:</strong> Apne PC ya mobile se MP4, MKV, MP3, WAV file upload karein.</li>
                  <li><strong>Google Drive:</strong> Direct apne Google Drive se saved video/audio file select karein.</li>
                  <li><strong>Voice Recording:</strong> Live microphone on karke apni aawaz record karein.</li>
                  <li><strong>Paste Transcript:</strong> Pehle se maujood text ya transcript direct paste karein.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Language & Settings Select Karein</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Default zuban <strong>Roman Urdu</strong> set hai. Agar aap chahein to <strong>Urdu (اردو)</strong> ya <strong>English</strong> bhi select kar sakte hain. Summary style mein "Detailed Study Notes", "Executive Summary", ya "Actionable Rules" chunein.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">"Summarize & Transcribe" Button Dabayen</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Button click karte hi Gemini 3.8 Flash audio ko transcribe karega aur high-yield study notes tayyar karega.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                4
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Side-by-Side View aur Downloads</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Summary aane ke baad:
                </p>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pt-1">
                  <li><strong>View Transcript Toggle:</strong> Is par click karke right side par poora transcript dekhein.</li>
                  <li><strong>Save to Google Drive:</strong> 1-click dabate hi notes aur transcript aapki Google Drive mein auto-upload ho jayenge.</li>
                  <li><strong>Download Buttons:</strong> Apne computer par `.TXT` aur `.MD` file save karein.</li>
                  <li><strong>Listen Audio:</strong> Speaker icon dabayein aur AI narration sunein.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                5
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Interactive Chat se Mazeed Seekhein</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Summary ke bilkul neeche interactive chat box hai. Wahan koi bhi question puchein aur AI usi video ke context se Roman Urdu mein jawab dega.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL SETUP GUIDE */}
      {activeGuideTab === 'local-setup' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Local Computer Par Run Karne Ke Steps (Node.js & npm)</h3>
              </div>
              <button
                onClick={() => copyToClipboard(npmSetupCommands, setCopiedNpmCmds)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                {copiedNpmCmds ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Commands</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy npm Commands</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Apne PC / Laptop par is pure project ko run karne ke liye yeh commands apne command prompt (CMD ya PowerShell) mein chalayein:
            </p>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
              {npmSetupCommands}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                Node.js Install Karein
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agar aapke PC par Node.js nahi hai, to <strong>nodejs.org</strong> par ja kar <strong>LTS version (v20 ya v22)</strong> download karke install karein.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Free Gemini API Key Hasil Karein
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>aistudio.google.com/app/apikey</strong> par ja kar bilkul FREE API Key banayein. Is par <strong>rozana 1,500 requests</strong> bilkul muft milti hain.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GITHUB PUBLISH */}
      {activeGuideTab === 'github-publish' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm text-white">GitHub Par Publish Karne Ke Steps (Git Push Guide)</h3>
              </div>
              <button
                onClick={() => copyToClipboard(gitPushCommands, setCopiedGitCmds)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
              >
                {copiedGitCmds ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Git Commands</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Git Commands</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Is poore project ko apne GitHub account par upload karne ke liye:
            </p>

            <pre className="p-4 bg-slate-950 text-blue-300 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
              {gitPushCommands}
            </pre>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Asaan Step-by-Step GitHub Instructions:</h4>
            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
              <li><strong>GitHub par Repository banayein:</strong> <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">github.com/new</a> par jayein. Repository ka naam likhein (maslan: <code>summarize-ai</code>).</li>
              <li><strong>Initialize with README ko UNCHECK rakhein:</strong> Kyunke hamare project mein pehle se shaandar README.md aur code tayyar hai.</li>
              <li><strong>Create Repository par click karein:</strong> GitHub aapko repository ka URL dega (maslan: <code>https://github.com/your-username/summarize-ai.git</code>).</li>
              <li><strong>Command run karein:</strong> Upar diye gaye commands mein apna URL daal kar terminal mein run kar dein!</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 5: OFFLINE PYTHON ENGINE */}
      {activeGuideTab === 'offline-engine' && (
        <div className="space-y-6">
          {/* Important Python version note */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <strong className="font-bold text-sm text-amber-950">Ahem Baat (Python Version Check):</strong>
              <p>
                Aapke computer par <code>Python 3.15</code> install hai jo ke experimental release hai, jiski wajah se <code>av</code> aur <code>faster-whisper</code> ke prebuilt wheels compile error de rahe hain.
              </p>
              <p>
                <strong>Asaan Hal (Solution):</strong> <a href="https://www.python.org/downloads/release/python-3119/" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">Python 3.11 ya 3.12</a> download karein. Python 3.11/3.12 par <code>pip install faster-whisper yt-dlp ollama</code> baghair kisi error ke 5 second mein install ho jata hai!
              </p>
            </div>
          </div>

          {/* Option A: 100% Unlimited Local PC Engine */}
          <div className="p-6 bg-slate-900 text-white rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    100% Free & Unlimited Local Python Script (`unlimited_offline.py`)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Faster-Whisper (Speech-to-Text) + Ollama Llama 3. Zero API keys, zero limits, zero bill.
                  </p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(python100PercentOfflineCode, setCopiedOffline)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0"
              >
                {copiedOffline ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Script</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Offline Script</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed max-h-72">
              {python100PercentOfflineCode}
            </pre>
          </div>

          {/* Option B: Direct Gemini 3.8 Flash Cloud Script */}
          <div className="p-6 bg-slate-800 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">
                  Cloud Gemini 3.8 Flash Python Script (`app.py`)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(pythonGeminiCode, setCopiedPython)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-200 hover:text-white font-semibold px-2.5 py-1 rounded border border-slate-700 bg-slate-900 cursor-pointer"
              >
                {copiedPython ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
              {pythonGeminiCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
