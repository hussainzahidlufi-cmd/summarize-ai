import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { PresetSelector, PRESET_LIST } from './components/PresetSelector';
import { SummaryViewer } from './components/SummaryViewer';
import { InteractiveChat } from './components/InteractiveChat';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GuideSection } from './components/GuideSection';
import { DriveExplorer } from './components/DriveExplorer';
import {
  initAuth,
  googleSignIn,
  logout
} from './services/googleDriveService';
import { User } from 'firebase/auth';
import {
  SummaryData,
  SummaryMeta,
  HistoryItem,
  SourceType,
  TargetLanguage
} from './types';
import { AlertCircle, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'summarize_ai_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'presets' | 'history' | 'guide' | 'drive'>('workspace');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [summaryMeta, setSummaryMeta] = useState<SummaryMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Firebase Auth listener for Google Drive
  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => setUser(u),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setError(err?.message || 'Google Sign-in failed. Please try again.');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  // Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  }, [history]);

  // Load default preset on initial load if no summary is active, so user immediately sees real content
  useEffect(() => {
    if (!summaryData) {
      loadPreset('smc-lecture-1', false);
    }
  }, []);

  const loadPreset = async (presetId: string, switchTab = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/presets/${presetId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSummaryData(json.data);
        const meta: SummaryMeta = {
          type: json.meta.sourceType as SourceType,
          targetLanguage: json.meta.targetLanguage,
          fileName: json.meta.title,
          analyzedAt: new Date().toISOString(),
          duration: json.meta.duration,
        };
        setSummaryMeta(meta);

        // Add to history if not duplicate
        setHistory((prev) => {
          if (prev.some((h) => h.id === presetId)) return prev;
          const newItem: HistoryItem = {
            id: presetId,
            title: json.data.title,
            targetLanguage: json.meta.targetLanguage,
            sourceType: json.meta.sourceType,
            fileName: json.meta.title,
            analyzedAt: new Date().toISOString(),
            data: json.data,
          };
          return [newItem, ...prev].slice(0, 30);
        });

        if (switchTab) {
          setActiveTab('workspace');
        }
      } else {
        throw new Error(json.error || 'Failed to load preset');
      }
    } catch (err: any) {
      console.error('Error loading preset:', err);
      setError(err?.message || 'Could not load course preset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async (payload: {
    type: SourceType;
    youtubeUrl?: string;
    fileData?: string;
    mimeType?: string;
    fileName?: string;
    transcript?: string;
    targetLanguage: TargetLanguage;
    customInstructions?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Summarization failed. Please verify input data.');
      }

      setSummaryData(result.data);
      const meta: SummaryMeta = {
        type: payload.type,
        targetLanguage: payload.targetLanguage,
        fileName: payload.fileName || (payload.type === 'youtube' ? payload.youtubeUrl! : 'Media'),
        analyzedAt: new Date().toISOString(),
      };
      setSummaryMeta(meta);

      // Add to history
      const historyEntry: HistoryItem = {
        id: Date.now().toString(),
        title: result.data.title || 'Media Summary',
        targetLanguage: payload.targetLanguage,
        sourceType: payload.type,
        fileName: meta.fileName,
        analyzedAt: meta.analyzedAt,
        data: result.data,
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 30));

      setActiveTab('workspace');
    } catch (err: any) {
      console.error('Summarize error:', err);
      setError(err?.message || 'Failed to process media with Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTTS = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.success && data.audioData) {
        return data.audioData;
      }
      return null;
    } catch (e) {
      console.warn('TTS API error, falling back', e);
      return null;
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSummaryData(item.data);
    setSummaryMeta({
      type: item.sourceType,
      targetLanguage: item.targetLanguage,
      fileName: item.fileName,
      analyzedAt: item.analyzedAt,
    });
    setActiveTab('workspace');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleDriveFileSelected = async (payload: {
    fileData: string;
    mimeType: string;
    fileName: string;
    type: 'file';
  }) => {
    setActiveTab('workspace');
    await handleSummarize({
      type: 'file',
      fileData: payload.fileData,
      mimeType: payload.mimeType,
      fileName: payload.fileName,
      targetLanguage: 'roman_urdu',
    });
  };

  const handleClearHistory = () => {
    if (confirm('Clear all saved summaries from this browser?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        onNewSummary={() => {
          setActiveTab('workspace');
          // Scroll up
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPresets={() => setActiveTab('presets')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Notice */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-sm text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Processing Notice: </span>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Routing */}
        {activeTab === 'presets' && (
          <PresetSelector
            onSelectPreset={(id) => loadPreset(id, true)}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'drive' && (
          <DriveExplorer
            user={user}
            onSelectFileForSummarize={handleDriveFileSelected}
            onSignIn={handleGoogleSignIn}
            onSignOut={handleGoogleSignOut}
          />
        )}

        {activeTab === 'guide' && <GuideSection />}

        {activeTab === 'workspace' && (
          <div className="space-y-8">
            {/* Input Section */}
            <InputSection
              onSummarize={handleSummarize}
              isLoading={isLoading}
              onOpenPresets={() => setActiveTab('presets')}
              user={user}
              onOpenDriveTab={() => setActiveTab('drive')}
              onSignInGoogle={handleGoogleSignIn}
            />

            {/* Summary Results */}
            {summaryData ? (
              <SummaryViewer
                data={summaryData}
                meta={summaryMeta || undefined}
                onOpenChat={() => setIsChatOpen(true)}
                onGenerateTTS={handleGenerateTTS}
                user={user}
                onSignInGoogle={handleGoogleSignIn}
              />
            ) : (
              !isLoading && (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-base font-semibold text-slate-800">
                    No summary loaded yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Enter a YouTube link above, upload your downloaded lecture video / audio, or load one of the Forex Dada SMC presets.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Q&A Assistant Drawer */}
      {summaryData && (
        <InteractiveChat
          summaryContext={summaryData}
          targetLanguage={summaryMeta?.targetLanguage || 'roman_urdu'}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            SummarizeAI · Video, Audio, and Lecture Intelligence with Google Gemini 3.8 Flash
          </div>
          <div className="flex items-center gap-4">
            <span>Roman Urdu Default</span>
            <span>·</span>
            <span>Urdu Script</span>
            <span>·</span>
            <span>English</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
