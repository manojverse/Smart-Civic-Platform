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
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        'Namaskaram! I am CivicSense AI, the smart municipal assistant for Vizianagaram Municipal Corporation (VMC). How can I assist you with civic grievances, helplines, or status updates today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPromptsEn = [
    { text: 'How do I report a pothole on Fort Road?', tag: 'Report Pothole' },
    { text: 'What is the emergency helpline for water leaks?', tag: 'Water Helpline' },
    { text: 'How does worker photo verification work?', tag: 'Quality Audit' },
    { text: 'Ma street lo drainage overflow undi, em cheyali?', tag: 'Drainage Issue' },
  ];

  const quickPromptsTe = [
    { text: 'మా వీధిలో డ్రైనేజీ సమస్య ఉంది, ఏమి చేయాలి?', tag: 'డ్రైనేజీ సమస్య' },
    { text: 'రోడ్డు గుంతలను ఫోటోతో ఎలా నివేదించాలి?', tag: 'గుంతల నివేదిక' },
    { text: 'తాగునీటి పైపులైన్ అత్యవసర హెల్ప్‌లైన్ ఏది?', tag: 'నీటి హెల్ప్‌లైన్' },
    { text: 'వర్కర్ పని పూర్తి చేసిన ఫోటోలను ఎలా చూడాలి?', tag: 'ఫోటో ప్రూఫ్' },
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

    // Simulate AI intelligent reasoning with bilingual response
    setTimeout(() => {
      let botResponse = '';
      let quickAction: Message['quickAction'];

      const lower = text.toLowerCase();

      if (lower.includes('pothole') || lower.includes('గుంత') || lower.includes('road')) {
        if (language === 'te') {
          botResponse =
            'రోడ్డు గుంతలను నివేదించడానికి "గ్రీవెన్స్ రిపోర్ట్" ట్యాబ్‌ను ఉపయోగించండి. మా AI సిస్టమ్ ఫోటోను పరిశీలించి, PWD శాఖకు మరియు సమీపంలోని ఫీల్డ్ వర్కర్‌కు స్వయంచాలకంగా అసైన్ చేస్తుంది.';
        } else {
          botResponse =
            'To report a pothole, open the "File Grievance" tab with GPS location and photo evidence. Our AI auto-classifies it under Public Works Department (PWD) and dispatches the nearest road patching crew within SLA.';
        }
        quickAction = { label: language === 'te' ? 'సమస్యను నివేదించండి' : 'File Complaint Now', tab: 'report' };
      } else if (lower.includes('water') || lower.includes('leak') || lower.includes('పైపు') || lower.includes('నీటి')) {
        if (language === 'te') {
          botResponse =
            'తాగునీటి సరఫరా అత్యవసర హెల్ప్‌లైన్: 08922-276188 (VMC వాటర్ వర్క్స్ కంట్రోల్ రూమ్). మునిసిపల్ ఫెసిలిటీస్ ట్యాబ్‌లో నేరుగా ఒక-టచ్ కాల్ చేయవచ్చు.';
        } else {
          botResponse =
            'For major water leaks or pipeline bursts, the 24x7 VMC Water Works Control Room helpline is 08922-276188. You can also locate emergency water valve stations under Smart City Services.';
        }
        quickAction = { label: language === 'te' ? 'హెల్ప్‌లైన్‌లు చూడండి' : 'Open Helplines', tab: 'services' };
      } else if (lower.includes('drainage') || lower.includes('డ్రైనేజీ') || lower.includes('sewage')) {
        if (language === 'te') {
          botResponse =
            'డ్రైనేజీ సమస్యల కోసం సూపర్-సక్కర్ డీ-సిల్టింగ్ వెహికల్ అందుబాటులో ఉంది. మీ వార్డు నంబర్ మరియు ల్యాండ్‌మార్క్‌తో పిటిషన్ దాఖలు చేయండి. మా పారిశుద్ధ్య అధికారి 24 గంటల్లో పరిష్కరిస్తారు.';
        } else {
          botResponse =
            'Drainage overflow is classified as P2-High priority under Water Supply & Sewerage Board. A super-sucker vacuum de-silting jet vehicle is dispatched to clear the blockage with worker photographic proof.';
        }
        quickAction = { label: language === 'te' ? 'డ్రైనేజీ సమస్య నమోదు' : 'Report Drainage Issue', tab: 'report' };
      } else if (lower.includes('photo') || lower.includes('proof') || lower.includes('verification') || lower.includes('ఫోటో')) {
        if (language === 'te') {
          botResponse =
            'CivicSense లో పారదర్శకత కోసం వర్కర్ పని ప్రారంభించే ముందు మరియు పని ముగిసిన తర్వాత రెండు ఫోటోలు తీసి అప్‌లోడ్ చేస్తారు. హైయర్ మునిసిపల్ ఆఫీసర్ తనిఖీ చేసి ఆమోదించిన తర్వాతే టికెట్ పూర్తవుతుంది.';
        } else {
          botResponse =
            'CivicSense enforces strict Dual Photographic Verification: Field workers must capture Before-Work and After-Work photos on-site. The Higher Municipal Official reviews side-by-side evidence before official resolution sign-off.';
        }
        quickAction = { label: language === 'te' ? 'స్టేటస్ ట్రాక్ చేయండి' : 'Track Complaints', tab: 'track' };
      } else {
        if (language === 'te') {
          botResponse =
            'విజయనగరం మునిసిపల్ కార్పొరేషన్ పౌర సేవల కోసం నేను మీకు సహాయం చేయగలను. మీరు చెత్త సమస్యలు, వీధి దీపాలు, తాగునీరు లేదా రోడ్డు మరమ్మతుల గురించి అడగవచ్చు.';
        } else {
          botResponse =
            'I can help you lodge municipal grievances, find nearby emergency utility hubs, track SLA deadlines, or explain photographic verification workflows across Vizianagaram Municipal Corporation.';
        }
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
          className="fixed bottom-20 md:bottom-8 right-6 z-40 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20 group"
          title="CivicSense Municipal AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700"></span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">CivicSense AI</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">CivicSense Assistant</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    AI Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Vizianagaram Municipal Corporation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-indigo-200 flex items-center gap-1 transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-3 h-3" />
                <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                      ? 'bg-indigo-600 text-white rounded-tr-none'
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition-colors"
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
            {(language === 'en' ? quickPromptsEn : quickPromptsTe).map((prompt, i) => (
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
              placeholder={
                language === 'en'
                  ? 'Ask in English or Telugu...'
                  : 'తెలుగు లేదా ఇంగ్లీషులో అడగండి...'
              }
              className="flex-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
