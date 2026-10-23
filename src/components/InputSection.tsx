import React, { useState, useRef } from 'react';
import {
  Youtube,
  Upload,
  Mic,
  FileText,
  Play,
  Square,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { TargetLanguage, SourceType } from '../types';
import { User } from 'firebase/auth';

interface InputSectionProps {
  onSummarize: (payload: {
    type: SourceType;
    youtubeUrl?: string;
    fileData?: string;
    mimeType?: string;
    fileName?: string;
    transcript?: string;
    targetLanguage: TargetLanguage;
    customInstructions?: string;
  }) => Promise<void>;
  isLoading: boolean;
  onOpenPresets: () => void;
  user?: User | null;
  onOpenDriveTab?: () => void;
  onSignInGoogle?: () => Promise<void>;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onSummarize,
  isLoading,
  onOpenPresets,
  user,
  onOpenDriveTab,
  onSignInGoogle,
}) => {
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  // Permanently set Roman Urdu as the default language
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(() => {
    try {
      const saved = localStorage.getItem('summarize_target_lang');
      return (saved as TargetLanguage) || 'roman_urdu';
    } catch {
      return 'roman_urdu';
    }
  });

  // Persist language preference
  React.useEffect(() => {
    try {
      localStorage.setItem('summarize_target_lang', targetLanguage);
    } catch {
      // ignore
    }
  }, [targetLanguage]);

  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Microphone access is required to record audio. Please check browser permissions.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'youtube') {
      if (!youtubeUrl.trim()) return;
      await onSummarize({
        type: 'youtube',
        youtubeUrl: youtubeUrl.trim(),
        targetLanguage,
        customInstructions: customInstructions.trim(),
      });
    } else if (sourceType === 'file') {
      if (!selectedFile || !fileBase64) return;
      await onSummarize({
        type: 'file',
        fileData: fileBase64,
        mimeType: selectedFile.type || 'video/mp4',
        fileName: selectedFile.name,
        targetLanguage,
        customInstructions: customInstructions.trim(),
      });
    } else if (sourceType === 'recording') {
      if (!recordedBase64) return;
      await onSummarize({
        type: 'file',
        fileData: recordedBase64,
        mimeType: 'audio/webm',
        fileName: `Voice_Recording_${new Date().toISOString().slice(0, 10)}.webm`,
        targetLanguage,
        customInstructions: customInstructions.trim(),
      });
    } else if (sourceType === 'transcript') {
      if (!transcriptText.trim()) return;
      await onSummarize({
        type: 'transcript',
        transcript: transcriptText.trim(),
        targetLanguage,
        customInstructions: customInstructions.trim(),
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Banner with Quick Presets Prompt */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Voice-Over to Text & Study Notes Engine</span>
          <span aria-hidden="true">·</span>
          <span>Full Speech-to-Text (No Spoken Line Missed) + Video-to-Text Study Notes</span>
        </div>
        <button
          type="button"
          onClick={onOpenPresets}
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Try Forex Dada SMC & Trading Course Presets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* Source Selector Segmented Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Media Source
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSourceType('youtube')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'youtube'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-600 shrink-0" />
              <span className="whitespace-nowrap">YouTube Link</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('file')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'file'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">Video / Audio</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('drive')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'drive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="whitespace-nowrap">Google Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('recording')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'recording'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">Voice Record</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('transcript')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'transcript'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="whitespace-nowrap">Transcript</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. YouTube Input */}
          {sourceType === 'youtube' && (
            <div className="space-y-3">
              <label htmlFor="yt-url" className="block text-sm font-semibold text-slate-900">
                YouTube Video URL
              </label>
              <div className="relative">
                <input
                  id="yt-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                <span>Try sample links:</span>
                <button
                  type="button"
                  onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
                  className="text-slate-700 underline hover:text-slate-900 cursor-pointer"
                >
                  First Video on YouTube (Me at the zoo)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=01-smc-forex-dada-lecture-1')}
                  className="text-slate-700 underline hover:text-slate-900 cursor-pointer"
                >
                  Forex Dada SMC Lecture 1 Link
                </button>
              </div>
            </div>
          )}

          {/* 2. File Upload Input */}
          {sourceType === 'file' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                Upload Media (MP4, MKV, MP3, WAV, M4A, WEBM)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? 'border-slate-400 bg-slate-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*,.mp4,.mkv,.webm,.mov,.avi,.mp3,.wav,.m4a,.aac"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="max-w-md mx-auto space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag and drop video / audio'}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · ${selectedFile.type || 'Media File'}`
                      : 'Supports Smart Money Concept lectures, trading webinars, MP4, MKV, MP3, WAV'}
                  </p>
                </div>
              </div>

              {/* Media Preview if selected */}
              {selectedFile && filePreviewUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Preview Player</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileBase64('');
                        setFilePreviewUrl('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Remove File
                    </button>
                  </div>
                  {selectedFile.type.startsWith('video') ? (
                    <video
                      controls
                      src={filePreviewUrl}
                      className="w-full max-h-60 rounded bg-black"
                    />
                  ) : (
                    <audio controls src={filePreviewUrl} className="w-full" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Google Drive Cloud Import */}
          {sourceType === 'drive' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                Google Drive Cloud Import
              </label>

              <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Select Audio or Video Lecture from Google Drive
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Directly browse videos (MP4, MKV), audio recordings (MP3, WAV), or lecture documents in your Google Drive to transcribe and summarize with Gemini.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={onOpenDriveTab}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>Browse Files in Google Drive</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onSignInGoogle}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      <span>Connect Google Drive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Voice Recording Input */}
          {sourceType === 'recording' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                Record Speech or Lecture Audio
              </label>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
                <div className="inline-flex items-center gap-2 font-mono tabular-nums text-2xl font-bold text-slate-900">
                  {formatSeconds(recordingDuration)}
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop Recording</span>
                    </button>
                  )}
                </div>

                {recordedAudioUrl && !isRecording && (
                  <div className="pt-2 max-w-md mx-auto">
                    <p className="text-xs text-slate-500 mb-2">Recorded Speech Audio Preview:</p>
                    <audio controls src={recordedAudioUrl} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Transcript Text Input */}
          {sourceType === 'transcript' && (
            <div className="space-y-3">
              <label htmlFor="transcript" className="block text-sm font-semibold text-slate-900">
                Paste Spoken Transcript, Lecture Notes, or Subtitles
              </label>
              <textarea
                id="transcript"
                rows={6}
                placeholder="Paste English, Urdu, or Roman Urdu transcript here... (e.g. Forex Dada SMC lecture notes, meeting speech, course dialogue)"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-sans"
              />
            </div>
          )}

          {/* Options Row: Target Language (Default Roman Urdu) & Custom Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Summary Language Output
                </label>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Permanent Default: Roman Urdu
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTargetLanguage('roman_urdu')}
                  className={`py-2 px-2 text-xs font-medium rounded transition-colors text-center cursor-pointer ${
                    targetLanguage === 'roman_urdu'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Roman Urdu
                </button>
                <button
                  type="button"
                  onClick={() => setTargetLanguage('urdu')}
                  className={`py-2 px-2 text-xs font-medium rounded transition-colors text-center cursor-pointer ${
                    targetLanguage === 'urdu'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اردو (Urdu)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetLanguage('english')}
                  className={`py-2 px-2 text-xs font-medium rounded transition-colors text-center cursor-pointer ${
                    targetLanguage === 'english'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {targetLanguage === 'roman_urdu' && 'Asaan Roman Urdu mein tafseeli summary, trading terms aur bullet points.'}
                {targetLanguage === 'urdu' && 'خالص اردو رسم الخط میں خلاصہ اور اہم نکات۔'}
                {targetLanguage === 'english' && 'Clear, professional executive summary in standard English.'}
              </p>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Focus Areas / Custom Instructions (Optional)
              </label>
              <input
                id="instructions"
                type="text"
                placeholder="e.g. Focus on SMC Order Block & Liquidity rules, or exam notes"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Guide Gemini 3.8 Flash to emphasize specific technical concepts or trading rules.
              </p>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isLoading ||
                (sourceType === 'youtube' && !youtubeUrl.trim()) ||
                (sourceType === 'file' && !fileBase64) ||
                (sourceType === 'recording' && !recordedBase64) ||
                (sourceType === 'transcript' && !transcriptText.trim())
              }
              className="w-full py-3.5 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting Voice-Over to Text & Generating Notes with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Generate Full Voice-Over Transcript, Notes & {targetLanguage === 'roman_urdu' ? 'Roman Urdu' : targetLanguage === 'urdu' ? 'Urdu' : 'English'} Summary
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
