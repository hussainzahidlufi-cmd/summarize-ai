import React from 'react';
import { Sparkles, History, BookOpen, HardDrive, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  onNewSummary: () => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  activeTab: 'workspace' | 'presets' | 'history' | 'guide' | 'drive';
  setActiveTab: (tab: 'workspace' | 'presets' | 'history' | 'guide' | 'drive') => void;
  historyCount: number;
  user: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  onNewSummary,
  onOpenHistory,
  onOpenPresets,
  activeTab,
  setActiveTab,
  historyCount,
  user,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-display font-bold text-base shadow-sm">
              S
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap">
              SummarizeAI
            </span>
          </button>
        </div>

        {/* Zone 2: Single-line Text Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeTab === 'workspace' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Summarizer
          </button>
          <button
            onClick={() => {
              setActiveTab('presets');
              onOpenPresets();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeTab === 'presets' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            SMC & Course Demos
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeTab === 'drive' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>Google Drive</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              onOpenHistory();
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeTab === 'history' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Saved Library ({historyCount})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeTab === 'guide' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Guide & Setup
          </button>
        </nav>

        {/* Zone 3: Gemini Connected status + Google Drive Auth + 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Gemini 3.8 Flash</span>
          </div>

          {/* Google Auth Status / Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setActiveTab('drive')}
                className="flex items-center gap-2 text-left hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer"
                title="Open Google Drive panel"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName?.[0] || 'G'}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Drive'}
                </span>
              </button>
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                title="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Sign in with Google to sync Drive"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span className="hidden sm:inline">Connect Drive</span>
            </button>
          )}

          <button
            onClick={onNewSummary}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            + New Summary
          </button>
        </div>
      </div>
    </header>
  );
};
