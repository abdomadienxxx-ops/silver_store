import React, { useState } from 'react';
import { Copy, Check, FileCode, Server, AppWindow, ArrowUpRight } from 'lucide-react';
import { 
  FLUTTER_DART_TEMPLATE_MODELS, 
  FLUTTER_DART_TEMPLATE_SERVICE, 
  FLUTTER_DART_TEMPLATE_UI 
} from '../lib/flutterTemplates';

export default function FlutterExporterTab() {
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'service' | 'ui'>('models');
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    switch (activeCodeTab) {
      case 'models': return FLUTTER_DART_TEMPLATE_MODELS;
      case 'service': return FLUTTER_DART_TEMPLATE_SERVICE;
      case 'ui': return FLUTTER_DART_TEMPLATE_UI;
    }
  };

  const getFileName = () => {
    switch (activeCodeTab) {
      case 'models': return 'lib/models.dart';
      case 'service': return 'lib/firestore_service.dart';
      case 'ui': return 'lib/main.dart';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2005);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-3 rtl" style={{ direction: 'rtl' }}>
      
      {/* Exporter header */}
      <div>
        <h3 className="text-sm font-bold text-teal-400">مصدّر كود فلاتر (Flutter Code Exporter)</h3>
        <p className="text-[10px] text-slate-350 mt-0.5">
          انسخ أكواد لغة **Dart** لبناء تطبيق هاتف حقيقي بنفس قاعدة البيانات ونظام الاتصال اللحظي!
        </p>
      </div>

      {/* Flutter step guide */}
      <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
        <span className="font-bold text-teal-300">خطوات تشغيل التطبيق على هاتفك المحمول:</span>
        <ol className="list-decimal list-inside space-y-1 text-slate-400">
          <li>أنشئ مشروع فلاتر جديد عن طريق <code className="text-teal-400">flutter create store_app</code></li>
          <li>أضف حزم <code className="text-amber-400 font-mono">firebase_core</code> و <code className="text-amber-400 font-mono">cloud_firestore</code> في ملف pubspec.yaml</li>
          <li>اربط مشروعك بـ Firebase باستخدام <code className="text-teal-400 font-mono">flutterfire configure</code></li>
          <li>انسخ واصنع الملفات الـ 3 الموضحة بالأسفل لتشغيل النظام حياً ومتزامناً!</li>
        </ol>
      </div>

      {/* Tabs list inside export panel */}
      <div className="flex bg-slate-905 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveCodeTab('models')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition duration-200 ${
            activeCodeTab === 'models' 
              ? 'bg-teal-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode size={11} />
          النماذج (Models)
        </button>
        <button
          onClick={() => setActiveCodeTab('service')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition duration-200 ${
            activeCodeTab === 'service' 
              ? 'bg-teal-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server size={11} />
          الاتصال الحي
        </button>
        <button
          onClick={() => setActiveCodeTab('ui')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition duration-200 ${
            activeCodeTab === 'ui' 
              ? 'bg-teal-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AppWindow size={11} />
          الواجهات (UI)
        </button>
      </div>

      {/* File name bar and Copy button */}
      <div className="bg-slate-950 px-3 py-2 border border-slate-800 rounded-t-xl flex justify-between items-center text-[10px] text-slate-300 font-mono">
        <span className="text-emerald-400 font-semibold">{getFileName()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 bg-slate-900 border border-slate-805 hover:bg-slate-800 text-teal-400 hover:text-teal-300 px-2 py-1 rounded text-[10px] font-bold transition"
        >
          {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
          {copied ? 'تم النسخ!' : 'نسخ الكود'}
        </button>
      </div>

      {/* Code viewer viewport */}
      <div className="flex-1 bg-slate-950 p-3 rounded-b-xl border-x border-b border-slate-800 overflow-auto font-mono text-[9px] text-teal-200 text-left" style={{ direction: 'ltr' }}>
        <pre className="whitespace-pre">{getCode()}</pre>
      </div>
      
    </div>
  );
}
