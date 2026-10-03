import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  Search,
  Globe,
  Stethoscope,
  Heart,
  HelpCircle,
  RefreshCw,
  Mic,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { speakMessage } from '../../services/audio';
import type { User as UserType } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingQueries?: string[];
}

interface MatruSurakshaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPatient?: UserType | null;
  defaultRoleContext?: 'patient_companion' | 'clinical_specialist';
  language?: string;
}

const DEFAULT_PROMPTS = {
  patient_companion: [
    'Is severe swelling in my feet and face dangerous?',
    'What should I eat to improve my iron levels?',
    'How many times should my baby kick in an hour?',
    'I have a pounding headache that will not go away.',
  ],
  clinical_specialist: [
    'ACOG Magnesium Sulfate loading dose & toxicity protocol',
    'Oral Nifedipine vs IV Labetalol in severe gestational HTN',
    'Diagnostic criteria for HELLP Syndrome in rural settings',
    'Timing of delivery for severe pre-eclampsia at 34 weeks',
  ],
};

export const MatruSurakshaChatModal: React.FC<MatruSurakshaChatModalProps> = ({
  isOpen,
  onClose,
  currentPatient,
  defaultRoleContext = 'patient_companion',
  language = 'en',
}) => {
  const [roleContext, setRoleContext] = useState<'patient_companion' | 'clinical_specialist'>(defaultRoleContext);
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      text:
        defaultRoleContext === 'clinical_specialist'
          ? 'Greetings Doctor. I am MatruSuraksha Clinical AI Consultant (मातृसुरक्षा - Sacred Maternal Guardian). I assist with WHO/ACOG evidence-based obstetrics protocols, severe pre-eclampsia management, and rural referral guidelines. How may I assist your triage decision today?'
          : 'Namaste & Welcome Mama! I am MatruSuraksha Companion (मातृसुरक्षा सहायक). You can ask me any question about your pregnancy, body changes, baby movements, or health symptoms.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

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

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.sendChatMessage({
        messages: payloadMessages,
        role_context: roleContext,
        patient_id: currentPatient?.id,
        use_search: useSearch,
      });

      if (res.success && res.reply) {
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          role: 'model',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingQueries: res.grounding_queries,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          text: 'I am here with you. Please note that if you are experiencing severe danger signs (severe headache, blurred vision, or sharp upper stomach pain), please contact your Community Health Worker immediately.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechOutput = (text: string) => {
    speakMessage(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto h-[88vh] flex flex-col">
        
        {/* Header with Sanskrit Name: MatruSuraksha (मातृसुरक्षा) */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-900/40">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display">MatruSuraksha AI</h3>
                <span className="text-xs font-semibold text-amber-300 font-sans tracking-wide">
                  (मातृसुरक्षा)
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  GEMINI ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {roleContext === 'clinical_specialist'
                  ? 'Clinical Obstetric Decision Support • WHO/ACOG Protocol AI'
                  : 'Sacred Maternal Companion • Reassuring Prenatal Guide'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher & Search Grounding Ribbon */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Role Persona Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setRoleContext('patient_companion')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                roleContext === 'patient_companion'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Mother Companion</span>
            </button>

            <button
              onClick={() => setRoleContext('clinical_specialist')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                roleContext === 'clinical_specialist'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clinical Specialist</span>
            </button>
          </div>

          {/* Search Grounding Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={useSearch}
              onChange={(e) => setUseSearch(e.target.checked)}
              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Google Search Grounding</span>
          </label>
        </div>

        {/* Scrollable Chat History Thread */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 bg-slate-50/50">
          
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-0.5">
                    <span className="font-bold">
                      {isUser ? 'You' : roleContext === 'clinical_specialist' ? 'MatruSuraksha Clinical AI' : 'MatruSuraksha Companion'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </p>

                  {/* Search Grounding Chips if present */}
                  {msg.groundingQueries && msg.groundingQueries.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                      <Search className="w-3 h-3 text-indigo-500" />
                      <span>Grounded with:</span>
                      {msg.groundingQueries.map((q, idx) => (
                        <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                          {q}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Audio Listen Button for Model Replies */}
                  {!isUser && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleSpeechOutput(msg.text)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                        title="Listen to audio explanation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="font-medium">
                {roleContext === 'clinical_specialist'
                  ? 'MatruSuraksha AI is analyzing medical literature...'
                  : 'MatruSuraksha Companion is thinking...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
          {DEFAULT_PROMPTS[roleContext].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600 border border-slate-200 rounded-full transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                roleContext === 'clinical_specialist'
                  ? 'Ask clinical protocol, dosage, or maternal triage question...'
                  : 'Ask about pregnancy, swelling, baby kicks, or health signs...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-indigo-500 focus:bg-white"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-colors shadow-xs disabled:opacity-50"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
