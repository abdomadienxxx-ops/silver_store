import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  activeEmployee: string;
}

export default function ChatTab({ messages, onSendMessage, activeEmployee }: ChatTabProps) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  // Quick preset alerts for instant workspace updates
  const presetShortcuts = [
    'وصل مستودع الصيانة تليفون عميل جديد',
    'صنف مكسور، تم تبديل الشاشات التالفة بنجاح',
    'طلب فحص المخزون الفوري لهاتف آيفون',
    'المشرف: قمنا بطلب كميات مستعجلة من الشواحن'
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-3" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="bg-slate-900 pb-1">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
          <MessageSquare size={14} className="text-teal-400" />
          غرفة دردشة ونبض الموظفين
        </h3>
        <p className="text-[10px] text-slate-400">تحديث فوري بين الأجهزة لمشاركة المبيعات الحية والتنسيق اليومي</p>
      </div>

      {/* Preset fast hotkeys */}
      <div className="space-y-1.5 bg-slate-850 p-2 rounded-xl border border-slate-800">
        <div className="text-[9px] text-teal-400 font-bold flex items-center gap-1">
          <Sparkles size={10} /> رسائل سريعة تفوق سرعة الكتابة:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presetShortcuts.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(preset)}
              className="bg-slate-900 hover:bg-slate-800 text-[10px] border border-slate-750 hover:border-teal-500/20 px-2 py-1 rounded text-slate-350 text-right transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Port */}
      <div className="flex-1 overflow-y-auto bg-slate-900/40 p-2 border border-slate-805 rounded-xl space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-[11px] text-slate-500">
            لا توجد محادثات سابقة. أرسل الآن رسالة لتجربة التزامن اللحظي على الهواتف الأخرى!
          </div>
        ) : (
          messages.slice().reverse().map(msg => {
            const isMe = msg.senderName === activeEmployee;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${isMe ? 'mr-auto ml-0 items-start' : 'ml-auto mr-0 items-end'}`}
              >
                {/* Sender Name tag */}
                <span className="text-[9px] text-slate-450 mb-0.5 px-1">{msg.senderName}</span>
                
                {/* Bubble content */}
                <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe 
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none' 
                    : 'bg-slate-850 text-slate-100 border border-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                
                {/* Time string */}
                <span className="text-[8px] text-slate-550 mt-0.5 px-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Text submission input field */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="اكتب رسالة فنية للموظفين الآخرين..."
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 bg-slate-850 text-slate-200 border border-slate-750 focus:border-teal-500 focus:outline-none rounded-xl px-3 py-2 text-xs"
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-slate-950 p-2 rounded-xl flex items-center justify-center transition"
        >
          <Send size={15} />
        </button>
      </form>
      
    </div>
  );
}
