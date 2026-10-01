import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ConsultantChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: any;
}

export const ConsultantChatDrawer: React.FC<ConsultantChatDrawerProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: '안녕하세요, 동료 상담사님! 새일센터 10년차 면접 컨설턴트입니다. 경력단절 구직자A의 면접 준비 과정에서 궁금한 점이나 돌발 질문 대처법이 있으시면 편하게 말씀해 주세요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6),
          context: context,
        }),
      });

      if (!response.ok) {
        throw new Error('컨설턴트 응답을 가져오지 못했습니다.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.response || '답변을 생성하지 못했습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `[오류 안내] ${err.message || '일시적 연결 오류가 발생했습니다. 잠시 후 다시 질문해 주세요.'}`,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '자녀 돌봄 관련 돌발 질문 대처법',
    '나이 어린 상사와의 협업 질문 답변 팁',
    '5년 공백기 질문 시 가장 피해야 할 말은?',
    '희망 급여 질문 시 현명한 답변 구조',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">새일센터 AI면접 코치 1:1 자문</h3>
            <p className="text-xs text-slate-500">새일센터 실전 코칭 노하우 실시간 질의응답</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            상담 원칙: 구직자의 개인정보(성명, 전화번호 등)는 입력하지 마시고 오직 경험과 직무 관련 고민 위주로 질문해 주세요.
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                m.role === 'user' ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className="max-w-[82%]">
              <div
                className={`p-3.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <div
                className={`text-[11px] text-slate-400 mt-1 tabular-nums ${
                  m.role === 'user' ? 'text-right' : ''
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl rounded-tl-none text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span>10년차 컨설턴트 분석 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-400 shrink-0 font-medium">자주 묻는 질문:</span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInput(q)}
            className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0 whitespace-nowrap text-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="상담사님의 고민이나 질문을 입력하세요..."
          className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3.5 py-2 bg-black text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
