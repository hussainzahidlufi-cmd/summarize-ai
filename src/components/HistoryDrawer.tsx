import React from 'react';
import { History, X, Trash2, ArrowUpRight, Clock, Video, FileText } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-800" />
          <h3 className="font-bold text-sm text-slate-900 font-display">
            Saved Summaries ({history.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm">No saved summaries yet.</p>
            <p className="text-xs text-slate-400">
              Summaries generated or loaded from presets will appear here automatically.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 border border-slate-200 rounded-xl hover:border-slate-400 bg-white hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3 group"
            >
              <div
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold uppercase">{item.sourceType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.targetLanguage}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(item.analyzedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs md:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-800">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {item.fileName}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button
                  onClick={() => onDelete(item.id)}
                  title="Delete summary"
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
