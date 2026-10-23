import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { ChatMessage, SummaryData, TargetLanguage } from '../types';

interface InteractiveChatProps {
  summaryContext: SummaryData;
  targetLanguage: TargetLanguage;
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  summaryContext,
  targetLanguage,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        targetLanguage === 'roman_urdu'
          ? `As-salamu alaykum! Maine is lecture/video "${summaryContext.title}" ka context load kar liya hai. Aap is video ke baare mein koi bhi sawal pooch sakte hain (jaise concepts, rules, ya kisi point ki mazeed wazahat).`
          : targetLanguage === 'urdu'
          ? `السلام علیکم! میں نے اس لیکچر "${summaryContext.title}" کا خلاصہ دیکھ لیا ہے۔ آپ اس کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔`
          : `Hello! I have loaded the context for "${summaryContext.title}". You can ask any question about the concepts, rules, or details discussed in this media.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.text,
          summaryContext,
          targetLanguage,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const result = await response.json();
      if (result.success && result.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: result.answer,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        throw new Error(result.error || 'Response error');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text:
            targetLanguage === 'roman_urdu'
              ? 'Mazarat, jawab generate karne mein masla aya. Baraye meherbani dobara koshish karein.'
              : 'Error retrieving answer. Please try again.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions =
    targetLanguage === 'roman_urdu'
      ? [
          'Is lecture ka main takeaway 2 lines mein batayein?',
          'Trading mein risk kaise control kiya jaye?',
          'Order Block ki confirmation kaise hoti hai?',
        ]
      : [
          'What is the core lesson of this video?',
          'Explain the most important rule mentioned.',
          'How can I practically apply this?',
        ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            AI
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Lecture Q&A Assistant
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[240px]">
              {summaryContext.title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-xs md:text-sm ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <div
                className={`text-[10px] mt-1.5 text-right ${
                  m.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            <span>Gemini thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(sq);
            }}
            className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              targetLanguage === 'roman_urdu'
                ? 'Apna sawal Roman Urdu mein yahan likhein...'
                : 'Ask a question about this lecture...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
