import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  MessageSquare,
  BookOpen,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Search,
  FileText,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  X,
  PanelRight,
  Eye,
  EyeOff,
  AlignLeft,
  List,
  HardDrive,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { SummaryData, SummaryMeta, TargetLanguage, TranscriptSegment, StudyNoteBlock } from '../types';
import { User } from 'firebase/auth';
import { saveTextFileToDrive } from '../services/googleDriveService';

interface SummaryViewerProps {
  data: SummaryData;
  meta?: SummaryMeta;
  onOpenChat: () => void;
  onGenerateTTS: (text: string) => Promise<string | null>;
  user?: User | null;
  onSignInGoogle?: () => Promise<void>;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({
  data,
  meta,
  onOpenChat,
  onGenerateTTS,
  user,
  onSignInGoogle,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'summary' | 'transcript' | 'notes'>('summary');
  const [showSideTranscript, setShowSideTranscript] = useState<boolean>(true); // 'View Transcript' toggle state
  const [sideViewMode, setSideViewMode] = useState<'segments' | 'continuous'>('segments');
  const [copied, setCopied] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [revealedQuiz, setRevealedQuiz] = useState<Record<number, boolean>>({});
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Google Drive Saving State
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<{ name: string; link?: string } | null>(null);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);

  // Fallback transcript segments if model returned raw text or chapters
  const transcriptSegments: TranscriptSegment[] = useMemo(() => {
    if (data.fullTranscript && data.fullTranscript.length > 0) {
      return data.fullTranscript;
    }
    if (data.rawTranscriptText) {
      return [
        {
          timestamp: '00:00 - End',
          speaker: 'Speaker / Voice-over',
          text: data.rawTranscriptText,
        },
      ];
    }
    // Generate segments from chapters if not provided
    if (data.chapters && data.chapters.length > 0) {
      return data.chapters.map((ch) => ({
        timestamp: ch.timestamp,
        speaker: 'Lecture Narration',
        text: `${ch.title}: ${ch.summary}`,
      }));
    }
    return [
      {
        timestamp: '00:00 - End',
        speaker: 'Voice-over Transcript',
        text: data.overview,
      },
    ];
  }, [data]);

  // Continuous raw text for copy or view
  const fullRawText = useMemo(() => {
    if (data.rawTranscriptText) return data.rawTranscriptText;
    return transcriptSegments.map((s) => s.text).join('\n\n');
  }, [data, transcriptSegments]);

  // Filtered transcript based on user search
  const filteredTranscript = useMemo(() => {
    if (!transcriptSearch.trim()) return transcriptSegments;
    const q = transcriptSearch.toLowerCase();
    return transcriptSegments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        (s.speaker && s.speaker.toLowerCase().includes(q)) ||
        s.timestamp.toLowerCase().includes(q)
    );
  }, [transcriptSegments, transcriptSearch]);

  // Fallback study notes if not provided
  const studyNoteBlocks: StudyNoteBlock[] = useMemo(() => {
    if (data.studyNotes && data.studyNotes.length > 0) {
      return data.studyNotes;
    }
    const notes: StudyNoteBlock[] = [];
    if (data.chapters && data.chapters.length > 0) {
      data.chapters.forEach((ch, idx) => {
        notes.push({
          topic: `${idx + 1}. ${ch.title}`,
          timestamp: ch.timestamp,
          content: ch.summary,
          keyBulletPoints: data.keyTakeaways.slice(idx * 2, idx * 2 + 2),
        });
      });
    } else {
      notes.push({
        topic: '1. Core Concepts & Overview',
        content: data.overview,
        keyBulletPoints: data.keyTakeaways,
      });
    }
    return notes;
  }, [data]);

  const handleCopySummary = () => {
    let fullText = `${data.title}\n\nOVERVIEW:\n${data.overview}\n\nKEY TAKEAWAYS:\n`;
    data.keyTakeaways.forEach((k, i) => {
      fullText += `${i + 1}. ${k}\n`;
    });

    if (data.technicalConcepts && data.technicalConcepts.length > 0) {
      fullText += `\nTECHNICAL CONCEPTS:\n`;
      data.technicalConcepts.forEach((c) => {
        fullText += `- ${c.term}: ${c.explanation}\n`;
      });
    }

    if (data.actionableRules && data.actionableRules.length > 0) {
      fullText += `\nACTIONABLE RULES:\n`;
      data.actionableRules.forEach((r, i) => {
        fullText += `${i + 1}. ${r}\n`;
      });
    }

    fullText += `\nCONCLUSION:\n${data.conclusion}\n`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTranscript = () => {
    const transcriptText = transcriptSegments
      .map((s) => `[${s.timestamp}] ${s.speaker ? s.speaker + ': ' : ''}${s.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(transcriptText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleCopyNotes = () => {
    let notesText = `# Study Notes: ${data.title}\n\n`;
    studyNoteBlocks.forEach((n) => {
      notesText += `## ${n.topic} (${n.timestamp || 'Section'})\n${n.content}\n\n`;
      if (n.keyBulletPoints && n.keyBulletPoints.length > 0) {
        notesText += `Key Rules & Takeaways:\n`;
        n.keyBulletPoints.forEach((b) => {
          notesText += `- ${b}\n`;
        });
        notesText += '\n';
      }
    });
    navigator.clipboard.writeText(notesText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleDownloadTranscript = (format: 'txt' | 'md' = 'txt') => {
    let content = '';
    const safeTitle = (data.title || 'Video_Lecture').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);

    if (format === 'txt') {
      content += `================================================================================\n`;
      content += `FULL VOICE-OVER RAW TRANSCRIPT: ${data.title}\n`;
      content += `================================================================================\n`;
      content += `Source File/Link: ${meta?.fileName || 'Media'}\n`;
      content += `Language: ${meta?.targetLanguage || 'Roman Urdu'}\n`;
      content += `Analyzed Date: ${meta?.analyzedAt ? new Date(meta.analyzedAt).toLocaleString() : new Date().toLocaleDateString()}\n`;
      content += `Total Dialogue Segments: ${transcriptSegments.length}\n`;
      content += `Estimated Word Count: ~${transcriptSegments.reduce((acc, s) => acc + s.text.split(' ').length, 0)} words\n`;
      content += `--------------------------------------------------------------------------------\n\n`;

      transcriptSegments.forEach((seg) => {
        content += `[${seg.timestamp}] ${seg.speaker ? seg.speaker + ': ' : ''}\n`;
        content += `${seg.text}\n\n`;
      });
    } else {
      // Markdown format for offline study & notes
      content += `# Full Voice-Over Raw Transcript: ${data.title}\n\n`;
      content += `> **Source**: ${meta?.fileName || 'Media'}  \n`;
      content += `> **Language**: ${meta?.targetLanguage || 'Roman Urdu'}  \n`;
      content += `> **Date**: ${meta?.analyzedAt ? new Date(meta.analyzedAt).toLocaleDateString() : new Date().toLocaleDateString()}  \n`;
      content += `> **Total Segments**: ${transcriptSegments.length}  \n\n`;
      content += `---\n\n`;
      content += `## Spoken Voice-Over Dialogue (Complete Speech-to-Text)\n\n`;

      transcriptSegments.forEach((seg) => {
        content += `### \`[${seg.timestamp}]\` ${seg.speaker || 'Narrator'}\n\n`;
        content += `${seg.text}\n\n`;
      });
    }

    const mime = format === 'txt' ? 'text/plain;charset=utf-8' : 'text/markdown;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}_Transcript.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateNotesMarkdown = () => {
    let content = `# Video-to-Text Study Notes: ${data.title}\n\n`;
    content += `**Source**: ${meta?.fileName || 'Media'}\n`;
    content += `**Target Language**: ${meta?.targetLanguage || 'Roman Urdu'}\n`;
    content += `**Date**: ${meta?.analyzedAt ? new Date(meta.analyzedAt).toLocaleDateString() : 'N/A'}\n\n`;
    content += `## Overview\n${data.overview}\n\n`;

    studyNoteBlocks.forEach((block) => {
      content += `### ${block.topic} [${block.timestamp || 'Section'}]\n`;
      content += `${block.content}\n\n`;
      if (block.keyBulletPoints && block.keyBulletPoints.length > 0) {
        content += `**Critical Rules & Formulas:**\n`;
        block.keyBulletPoints.forEach((pt) => {
          content += `- ${pt}\n`;
        });
        content += '\n';
      }
    });

    if (data.actionableRules && data.actionableRules.length > 0) {
      content += `## Actionable Execution Rules\n`;
      data.actionableRules.forEach((r) => {
        content += `1. ${r}\n`;
      });
      content += '\n';
    }

    content += `## Conclusion\n${data.conclusion}\n`;
    return content;
  };

  const handleDownloadNotesMD = () => {
    const content = generateNotesMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}_Study_Notes.md`;
    link.click();
  };

  const handleSaveToGoogleDrive = async (type: 'notes' | 'transcript') => {
    if (!user) {
      if (onSignInGoogle) {
        try {
          await onSignInGoogle();
        } catch {
          return;
        }
      } else {
        alert('Please connect your Google Drive account first.');
        return;
      }
    }

    setIsSavingToDrive(true);
    setDriveSaveError(null);
    setDriveSaveSuccess(null);

    try {
      const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35);
      if (type === 'notes') {
        const md = generateNotesMarkdown();
        const fileName = `${sanitizedTitle}_Notes.md`;
        const res = await saveTextFileToDrive({
          name: fileName,
          content: md,
          mimeType: 'text/markdown',
        });
        setDriveSaveSuccess({ name: fileName, link: res.webViewLink });
      } else {
        const txt = transcriptSegments
          .map((s) => `[${s.timestamp}] ${s.speaker ? s.speaker + ': ' : ''}${s.text}`)
          .join('\n\n');
        const fileName = `${sanitizedTitle}_Transcript.txt`;
        const res = await saveTextFileToDrive({
          name: fileName,
          content: txt,
          mimeType: 'text/plain',
        });
        setDriveSaveSuccess({ name: fileName, link: res.webViewLink });
      }
    } catch (err: any) {
      console.error('Failed to save to Google Drive:', err);
      setDriveSaveError(err?.message || 'Failed to save file to Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const toggleSpeech = async () => {
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${data.title}. ${data.overview}. Key points: ${data.keyTakeaways.slice(0, 3).join('. ')}. Conclusion: ${data.conclusion}`;

    setAudioLoading(true);
    try {
      const audioUrl = await onGenerateTTS(textToRead);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setAudioElement(audio);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          fallbackBrowserTTS(textToRead);
        };
        await audio.play();
        setIsPlayingAudio(true);
      } else {
        fallbackBrowserTTS(textToRead);
      }
    } catch (err) {
      fallbackBrowserTTS(textToRead);
    } finally {
      setAudioLoading(false);
    }
  };

  const fallbackBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  const isUrduScript = meta?.targetLanguage === 'urdu';
  const isSideTranscriptOpen = showSideTranscript && activeViewTab !== 'transcript';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Banner and Navigation Tabs */}
      <div className="p-6 md:p-8 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="space-y-1.5 max-w-3xl">
            {/* Zero-pill metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {meta?.type ? meta.type.toUpperCase() : 'MEDIA'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {meta?.targetLanguage === 'roman_urdu'
                  ? 'Roman Urdu'
                  : meta?.targetLanguage === 'urdu'
                  ? 'Urdu Script'
                  : 'English'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{meta?.fileName || 'Media Summary'}</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Audio/Video Speech-to-Text</span>
            </div>

            <h1
              className={`text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug ${
                isUrduScript ? 'font-urdu' : ''
              }`}
            >
              {data.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 1. VIEW TRANSCRIPT TOGGLE (Side-by-side with summary) */}
            <button
              onClick={() => setShowSideTranscript((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                showSideTranscript
                  ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title={showSideTranscript ? 'Hide side-by-side transcript' : 'View full raw transcript alongside the summary'}
            >
              <PanelRight className="w-3.5 h-3.5" />
              <span>{showSideTranscript ? 'Hide Transcript' : 'View Transcript'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  showSideTranscript ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Side-by-Side
              </span>
            </button>

            {/* 2. AUDIO LISTEN */}
            <button
              onClick={toggleSpeech}
              disabled={audioLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Listen to summary via audio narration"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>{audioLoading ? 'Loading Audio...' : 'Listen Audio'}</span>
                </>
              )}
            </button>

            {/* 3. DEDICATED DOWNLOAD TRANSCRIPT BUTTON (.TXT or .MD) */}
            <div className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
              <button
                onClick={() => handleDownloadTranscript('txt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:text-slate-900 transition-colors cursor-pointer border-r border-slate-200"
                title="Download full verbatim transcript as text file"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>Download Transcript</span>
              </button>
              <button
                onClick={() => handleDownloadTranscript('txt')}
                className="px-2 py-1.5 text-[11px] font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-r border-slate-200 cursor-pointer"
                title="Download as .TXT"
              >
                .TXT
              </button>
              <button
                onClick={() => handleDownloadTranscript('md')}
                className="px-2 py-1.5 text-[11px] font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-lg transition-colors cursor-pointer"
                title="Download as .MD (Markdown for offline note-taking)"
              >
                .MD
              </button>
            </div>

            {/* 4. EXPORT NOTES */}
            <button
              onClick={handleDownloadNotesMD}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
              <span>Export Notes (.MD)</span>
            </button>

            {/* 5. SAVE TO GOOGLE DRIVE */}
            <div className="relative inline-flex items-center rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-xs font-semibold text-blue-800 shadow-2xs">
              <button
                onClick={() => handleSaveToGoogleDrive('notes')}
                disabled={isSavingToDrive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:text-blue-900 transition-colors cursor-pointer border-r border-blue-200"
                title="Save Complete Study Notes & Summary to Google Drive"
              >
                {isSavingToDrive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{isSavingToDrive ? 'Saving...' : 'Save to Drive'}</span>
              </button>
              <button
                onClick={() => handleSaveToGoogleDrive('notes')}
                disabled={isSavingToDrive}
                className="px-2 py-1.5 text-[11px] font-mono text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors border-r border-blue-200 cursor-pointer"
                title="Save Notes (.md) to Drive"
              >
                Notes
              </button>
              <button
                onClick={() => handleSaveToGoogleDrive('transcript')}
                disabled={isSavingToDrive}
                className="px-2 py-1.5 text-[11px] font-mono text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-r-lg transition-colors cursor-pointer"
                title="Save Raw Transcript (.txt) to Drive"
              >
                Transcript
              </button>
            </div>

            {/* 6. ASK QUESTIONS */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Questions (Q&A)</span>
            </button>
          </div>
        </div>

        {/* Google Drive Save Feedback Alert */}
        {driveSaveSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Saved <strong>{driveSaveSuccess.name}</strong> to your Google Drive in folder{' '}
                <em>'SummarizeAI Notes & Transcripts'</em>!
              </span>
            </div>
            {driveSaveSuccess.link && (
              <a
                href={driveSaveSuccess.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {driveSaveError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
            <span>{driveSaveError}</span>
            <button
              onClick={() => setDriveSaveError(null)}
              className="font-semibold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3 Main View Tabs (Summary, Full Voice-Over Transcript, Study Notes) */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveViewTab('summary')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all text-center cursor-pointer ${
              activeViewTab === 'summary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive Summary & Concepts
          </button>

          <button
            onClick={() => setActiveViewTab('transcript')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeViewTab === 'transcript'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Voice-Over Full Transcript</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
              {transcriptSegments.length} Segments
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('notes')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeViewTab === 'notes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Video-to-Text Study Notes</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
              {studyNoteBlocks.length} Topics
            </span>
          </button>
        </div>
      </div>

      {/* Main Content View with Optional Side-by-Side Transcript Panel */}
      <div className="p-6 md:p-8">
        <div
          className={
            isSideTranscriptOpen
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
              : 'w-full'
          }
        >
          {/* Main Left Column (Summary / Notes / Full Tab) */}
          <div
            className={
              isSideTranscriptOpen
                ? 'lg:col-span-7 xl:col-span-7 space-y-8'
                : 'w-full space-y-8'
            }
          >
            {/* TAB 1: EXECUTIVE SUMMARY */}
            {activeViewTab === 'summary' && (
              <div className="space-y-8">
                {/* Overview */}
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Overview & Core Objective
                  </h2>
                  <p
                    className={`text-sm md:text-base text-slate-800 leading-relaxed ${
                      isUrduScript ? 'font-urdu text-right text-base md:text-lg' : ''
                    }`}
                  >
                    {data.overview}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">
                      Key Highlights & Core Takeaways
                    </h2>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      ({data.keyTakeaways.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {data.keyTakeaways.map((takeaway, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center shrink-0 text-xs font-mono font-bold text-slate-700 mt-0.5">
                          {index + 1}
                        </div>
                        <p
                          className={`text-sm text-slate-800 leading-relaxed ${
                            isUrduScript ? 'font-urdu text-right w-full text-base' : ''
                          }`}
                        >
                          {takeaway}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Concepts */}
                {data.technicalConcepts && data.technicalConcepts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">
                        Technical Terms & Concept Definitions
                      </h2>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        ({data.technicalConcepts.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.technicalConcepts.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-slate-50/70 border border-slate-200"
                        >
                          <div className="text-xs font-bold text-slate-900 font-mono mb-1.5 flex items-center justify-between">
                            <span>{item.term}</span>
                            <span className="text-slate-400 font-normal">Definition</span>
                          </div>
                          <p
                            className={`text-xs md:text-sm text-slate-700 leading-relaxed ${
                              isUrduScript ? 'font-urdu text-right' : ''
                            }`}
                          >
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapters Breakdown */}
                {data.chapters && data.chapters.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">
                        Timeline & Chapter Breakdown
                      </h2>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        ({data.chapters.length})
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {data.chapters.map((ch, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                        >
                          <div className="sm:w-36 shrink-0 flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ch.timestamp}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="text-sm font-semibold text-slate-900">
                              {ch.title}
                            </div>
                            <p
                              className={`text-xs md:text-sm text-slate-600 leading-relaxed ${
                                isUrduScript ? 'font-urdu text-right' : ''
                              }`}
                            >
                              {ch.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Rules */}
                {data.actionableRules && data.actionableRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">
                        Actionable Execution Rules
                      </h2>
                    </div>

                    <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3">
                      {data.actionableRules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p
                            className={`text-xs md:text-sm text-slate-200 leading-relaxed ${
                              isUrduScript ? 'font-urdu text-right w-full' : ''
                            }`}
                          >
                            {rule}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conclusion */}
                <div className="pt-4 border-t border-slate-200">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Final Conclusion & Summary Takeaway
                  </h2>
                  <p
                    className={`text-sm text-slate-800 leading-relaxed ${
                      isUrduScript ? 'font-urdu text-right text-base' : ''
                    }`}
                  >
                    {data.conclusion}
                  </p>
                </div>

                {/* Retention Quiz */}
                {data.quizQuestions && data.quizQuestions.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-slate-700" />
                        <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">
                          Check Your Understanding (3-Question Quiz)
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500">Test Retention</span>
                    </div>

                    <div className="space-y-3">
                      {data.quizQuestions.map((q, idx) => {
                        const isRevealed = revealedQuiz[idx];
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-slate-50 border border-slate-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="text-sm font-medium text-slate-900">
                                <span className="font-mono font-bold mr-2">{idx + 1}.</span>
                                {q.question}
                              </div>
                              <button
                                onClick={() =>
                                  setRevealedQuiz((prev) => ({ ...prev, [idx]: !prev[idx] }))
                                }
                                className="text-xs font-semibold text-slate-700 hover:text-slate-900 whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isRevealed ? 'Hide Answer' : 'Show Answer'}</span>
                                {isRevealed ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {isRevealed && (
                              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs md:text-sm text-emerald-800 bg-emerald-50/60 p-3 rounded">
                                <span className="font-semibold">Answer: </span>
                                {q.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VIDEO-TO-TEXT STUDY NOTES */}
            {activeViewTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Video-to-Text Lecture Study Notes & Cheat-sheet
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Structured, in-depth academic notes formatted for quick reading, revision, and exam/trading prep.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyNotes}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedNotes ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Notes</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-700" />
                          <span>Copy All Notes</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadNotesMD}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download (.MD)</span>
                    </button>
                  </div>
                </div>

                {/* Notes Blocks */}
                <div className="space-y-6">
                  {studyNoteBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-base font-bold text-slate-900 font-display">
                          {block.topic}
                        </h4>
                        {block.timestamp && (
                          <span className="text-xs font-mono font-medium text-slate-500">
                            {block.timestamp}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm text-slate-800 leading-relaxed ${
                          isUrduScript ? 'font-urdu text-right text-base' : ''
                        }`}
                      >
                        {block.content}
                      </p>

                      {block.keyBulletPoints && block.keyBulletPoints.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Critical Rules, Parameters & Formulas
                          </span>
                          <ul className="space-y-1.5">
                            {block.keyBulletPoints.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                <span className={isUrduScript ? 'font-urdu text-right w-full' : ''}>
                                  {pt}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: VOICE-OVER FULL TRANSCRIPT (FULL PAGE TAB) */}
            {activeViewTab === 'transcript' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Full Spoken Voice-Over Raw Transcription
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Complete verbatim speech converted into text without missing dialogue, arranged by timestamps.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTranscript}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedTranscript ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Transcript</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-700" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadTranscript('txt')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Download full transcript as .TXT file"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download Transcript (.TXT)</span>
                    </button>

                    <button
                      onClick={() => handleDownloadTranscript('md')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Download full transcript formatted as Markdown (.MD)"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download Transcript (.MD)</span>
                    </button>
                  </div>
                </div>

                {/* Search bar inside Transcript */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search words in transcript (e.g. 'Order Block', 'Liquidity', 'Stop loss', 'Rule')..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {transcriptSearch && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                      {filteredTranscript.length} matches
                    </span>
                  )}
                </div>

                {/* Transcript Dialogue List */}
                <div className="space-y-4">
                  {filteredTranscript.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No matching lines found for "{transcriptSearch}".
                    </div>
                  ) : (
                    filteredTranscript.map((seg, idx) => (
                      <div
                        key={idx}
                        className="p-4.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {seg.timestamp}
                            </span>
                            {seg.speaker && (
                              <span className="font-medium text-slate-800">
                                {seg.speaker}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(seg.text);
                              alert('Line copied to clipboard');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-600 hover:text-slate-900 transition-opacity"
                          >
                            Copy Line
                          </button>
                        </div>
                        <p
                          className={`text-sm text-slate-800 leading-relaxed ${
                            isUrduScript ? 'font-urdu text-right text-base' : ''
                          }`}
                        >
                          {seg.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Raw Transcript Panel (ALONGSIDE SUMMARY WHEN TOGGLED) */}
          {isSideTranscriptOpen && (
            <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 bg-slate-50/90 border border-slate-300 rounded-xl p-5 space-y-4 shadow-sm">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 font-display">
                    Full Raw Transcript
                  </h3>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                    {transcriptSegments.length} Segments
                  </span>
                </div>
                <button
                  onClick={() => setShowSideTranscript(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                  title="Close side transcript view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Download Buttons Row inside the Side Panel */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Download Raw:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadTranscript('txt')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                    title="Download raw transcript as .txt file"
                  >
                    <Download className="w-3 h-3 text-slate-600" />
                    <span>.TXT</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTranscript('md')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                    title="Download raw transcript as .md Markdown file"
                  >
                    <FileText className="w-3 h-3 text-slate-600" />
                    <span>.MD</span>
                  </button>
                  <button
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                    title="Copy full transcript"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* View Mode Toggle: Segments vs Continuous Text */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded-md text-xs">
                  <button
                    onClick={() => setSideViewMode('segments')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      sideViewMode === 'segments'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timestamped Segments
                  </button>
                  <button
                    onClick={() => setSideViewMode('continuous')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      sideViewMode === 'continuous'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Continuous Raw Text
                  </button>
                </div>
              </div>

              {/* Quick Search inside Side Transcript */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search in transcript..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Transcript Scroll Area */}
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1 text-xs text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200">
                {sideViewMode === 'continuous' ? (
                  <div
                    className={`leading-relaxed whitespace-pre-line text-xs md:text-sm text-slate-800 ${
                      isUrduScript ? 'font-urdu text-right text-base' : ''
                    }`}
                  >
                    {fullRawText}
                  </div>
                ) : (
                  filteredTranscript.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.2 rounded">
                          {seg.timestamp}
                        </span>
                        {seg.speaker && <span className="text-slate-600 truncate">{seg.speaker}</span>}
                      </div>
                      <p
                        className={`leading-relaxed text-slate-800 ${
                          isUrduScript ? 'font-urdu text-right text-sm' : ''
                        }`}
                      >
                        {seg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
