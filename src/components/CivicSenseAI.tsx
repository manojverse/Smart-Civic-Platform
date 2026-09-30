import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageSquare,
  Globe,
  ArrowRight,
  ShieldCheck,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickAction?: {
    label: string;
    tab: string;
  };
}

interface CivicSenseAIProps {
  onNavigate?: (tab: string) => void;
}

export const CivicSenseAI: React.FC<CivicSenseAIProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        'Hello! I am Civic Assistant, your smart guide for civic issues, complaint tracking, and municipal service inquiries. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    { text: 'How do I report a road pothole or damage?', tag: 'Report Pothole' },
    { text: 'What is the procedure for water leakage reporting?', tag: 'Water Leakage' },
    { text: 'How does worker photo verification work?', tag: 'Verification Process' },
    { text: 'How can I check the status of my complaint?', tag: 'Complaint Status' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let botResponse = '';
      let quickAction: Message['quickAction'];
      const lower = text.toLowerCase();

      if (lower.includes('pothole') || lower.includes('road') || lower.includes('damage')) {
        botResponse =
          'To report a pothole or road damage, click "Report Issue" to attach photos and GPS location. The system will auto-route your complaint to the Public Works Department.';
        quickAction = { label: 'Report Issue Now', tab: 'report' };
      } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe')) {
        botResponse =
          'Water pipeline leaks can be reported directly via "Report Issue" or you can view emergency municipal contact numbers in the Civic Facilities tab.';
        quickAction = { label: 'View Facilities & Helplines', tab: 'services' };
      } else if (lower.includes('drainage') || lower.includes('sewage') || lower.includes('clean')) {
        botResponse =
          'Drainage overflows are handled by Sanitation & Public Health. Submit a complaint with the location, and field crews will be assigned.';
        quickAction = { label: 'Report Drainage Issue', tab: 'report' };
      } else if (lower.includes('photo') || lower.includes('proof') || lower.includes('verification')) {
        botResponse =
          'Smart Civic uses Dual Photo Verification: workers upload before-work and after-work photos on-site before a complaint can be resolved and closed.';
        quickAction = { label: 'Track Complaints', tab: 'tracking' };
      } else {
        botResponse =
          'You can use Smart Civic to report issues, track complaint resolution progress, view civic statistics on the map, or access municipal department helplines.';
      }

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-emerald-500 group"
          title="Civic Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-700"></span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Civic Assistant</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-h-[calc(100dvh-100px)] h-[540px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Civic Assistant</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-semibold">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Smart Civic Resolution Platform</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.quickAction && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate(m.quickAction!.tab);
                          }
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px] transition-colors"
                      >
                        <span>{m.quickAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt.text)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
              >
                {prompt.tag}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
