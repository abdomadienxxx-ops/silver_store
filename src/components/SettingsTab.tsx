import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Plus, 
  Check, 
  Wrench, 
  Sparkles, 
  FileCode, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Layers, 
  Smartphone, 
  Info,
  Copy,
  Server,
  AppWindow,
  Download
} from 'lucide-react';
import { 
  FLUTTER_DART_TEMPLATE_MODELS, 
  FLUTTER_DART_TEMPLATE_SERVICE, 
  FLUTTER_DART_TEMPLATE_UI 
} from '../lib/flutterTemplates';
import { InventoryItem } from '../types';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

interface SettingsTabProps {
  categories: CategoryItem[];
  onAddCategory: (id: string, name: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
  employees: string[];
  onAddEmployee: (name: string) => void;
  onDeleteEmployee: (name: string) => void;
  isOfflineSimulation: boolean;
  onToggleOffline: () => void;
  onResetAllData: () => void;
  anonymousAuthRestricted: boolean;
  inventory: InventoryItem[];
}

const COMMON_EMOJIS = ['📱', '🔌', '🛠️', '🔋', '🛡️', '🎧', '📦', '💻', '⚙️', '💰', '🔈', '📸'];

export default function SettingsTab({
  categories,
  onAddCategory,
  onDeleteCategory,
  employees,
  onAddEmployee,
  onDeleteEmployee,
  isOfflineSimulation,
  onToggleOffline,
  onResetAllData,
  anonymousAuthRestricted,
  inventory
}: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'employees' | 'flutter' | 'system'>('categories');
  
  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  
  // Employee form state
  const [newEmpName, setNewEmpName] = useState('');
  
  // Flutter code state
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'service' | 'ui' | 'inventory_json'>('models');
  const [copied, setCopied] = useState(false);

  const getInventoryJson = () => {
    return JSON.stringify(
      inventory.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        model: item.model,
        price: Number(item.price),
        stock: Number(item.stock),
        image: item.image || null,
        updatedBy: item.updatedBy,
        updatedAt: item.updatedAt
      })),
      null,
      2
    );
  };

  const getCode = () => {
    switch (activeCodeTab) {
      case 'models': return FLUTTER_DART_TEMPLATE_MODELS;
      case 'service': return FLUTTER_DART_TEMPLATE_SERVICE;
      case 'ui': return FLUTTER_DART_TEMPLATE_UI;
      case 'inventory_json': {
        const jsonStr = getInventoryJson();
        const dartHelper = `// طريقة استيراد وتحويل ملف الـ JSON هذا في تطبيق فلاتر (Flutter Parsing Code):
// ------------------------------------------------------------------
// import 'dart:convert';
//
// List<InventoryItem> loadInventoryFromJson(String jsonRaw) {
//   final List<dynamic> list = jsonDecode(jsonRaw);
//   return list.map((item) => InventoryItem.fromMap(item as Map<String, dynamic>, item['id'] ?? '')).toList();
// }

`;
        return dartHelper + jsonStr;
      }
    }
  };

  const getFileName = () => {
    switch (activeCodeTab) {
      case 'models': return 'lib/models.dart';
      case 'service': return 'lib/firestore_service.dart';
      case 'ui': return 'lib/main.dart';
      case 'inventory_json': return 'assets/inventory_export.json';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = getInventoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    // Generate a clean id
    const catId = 'cat_' + Date.now().toString(36);
    onAddCategory(catId, newCatName.trim(), selectedEmoji);
    setNewCatName('');
  };

  const handleAddEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    onAddEmployee(newEmpName.trim());
    setNewEmpName('');
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="bg-slate-900 pb-1 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Settings size={15} className="text-teal-400" />
            لوحة الإعدادات والتحكم الكامل
          </h3>
          <p className="text-[10px] text-slate-400">تحكم بالأقسام، فريق العمل، الأكواد البرمجية والتخزين</p>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`py-2 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-1 transition ${
            activeSubTab === 'categories' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Layers size={13} />
          <span>الأقسام ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('employees')}
          className={`py-2 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-1 transition ${
            activeSubTab === 'employees' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Users size={13} />
          <span>طاقم العمل ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('flutter')}
          className={`py-2 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-1 transition ${
            activeSubTab === 'flutter' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileCode size={13} />
          <span>كود Flutter</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`py-2 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-1 transition relative ${
            activeSubTab === 'system' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {anonymousAuthRestricted && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <Smartphone size={13} />
          <span>حالة النظام</span>
        </button>
      </div>

      {/* Sub tabs content panel */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-4">
        
        {/* TAB 1: CATEGORIES DEPARTMENT MANAGEMENT */}
        {activeSubTab === 'categories' && (
          <div className="space-y-4 animate-fade-in">
            {/* Form to add categories */}
            <form onSubmit={handleAddCatSubmit} className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <Plus size={12} />
                <span>إضافة قسم / تصنيف بضاعة جديد:</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-450 block mb-1">اسم القسم بالكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شواحن سريع"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-450 block mb-1">أيقونة القسم ({selectedEmoji})</label>
                  <div className="relative">
                    <select
                      value={selectedEmoji}
                      onChange={(e) => setSelectedEmoji(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none appearance-none"
                    >
                      {COMMON_EMOJIS.map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                    <div className="absolute left-2.5 top-2.5 pointer-events-none text-[10px] text-slate-400">▼</div>
                  </div>
                </div>
              </div>

              {/* Emoji quick selector wrapper */}
              <div className="space-y-1">
                <span className="text-[8px] text-slate-450 block">اختر أيقونة سريعة:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-7 h-7 rounded text-xs flex items-center justify-center transition border ${
                        selectedEmoji === emoji ? 'bg-teal-500/20 border-teal-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1"
              >
                <Plus size={13} />
                تأكيد وبناء القسم
              </button>
            </form>

            {/* Categories list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-350 block">الأقسام الحالية المعتمدة بالمحل:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between transition hover:border-slate-750"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base bg-slate-900 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800">{cat.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{cat.name}</span>
                        <span className="text-[8px] font-mono text-slate-450">ID: {cat.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-400 bg-slate-900/50 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition"
                      title="مسح القسم"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STAFF LIST TEAM MANAGEMENT */}
        {activeSubTab === 'employees' && (
          <div className="space-y-4 animate-fade-in">
            {/* Form to add employee */}
            <form onSubmit={handleAddEmpSubmit} className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <Users size={12} />
                <span>إضافة موظف جديد بالفريق الكاشير/الفنيين:</span>
              </div>

              <div>
                <label className="text-[9px] text-slate-450 block mb-1">اسم الموظف ووظيفته (مثال: كريم الكاشير)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صالح الفني (الصيانة)"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1"
              >
                <Plus size={13} />
                تسجيل الموظف بقاعدة البيانات
              </button>
            </form>

            {/* Employee lists */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-350 block">موظفي المحل النشطين المقيدين:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {employees.map((emp) => (
                  <div
                    key={emp}
                    className="bg-slate-850 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between transition hover:border-slate-750"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <span className="text-xs font-semibold text-slate-200">{emp}</span>
                    </div>

                    <button
                      onClick={() => onDeleteEmployee(emp)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-400 bg-slate-900/50 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition"
                      title="مسح الموظف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FLUTTER CODE DIRECT INTEGRATION */}
        {activeSubTab === 'flutter' && (
          <div className="space-y-3 animate-fade-in">
            {/* Guide message */}
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1.5 leading-relaxed">
              <div className="font-bold text-teal-300 flex items-center gap-1">
                <Info size={11} />
                <span>طريقة تشغيل التطبيق حياً للموبايل:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>قم ببناء مشروع Flutter باستعمال <code className="text-teal-400 font-mono">flutter create</code></li>
                <li>أضف مكتبتي <code className="text-amber-400 font-mono">cloud_firestore</code> في Pubspec</li>
                <li>قم بتقديم كود Dart المكتوب بالأسفل لتشغيل المشروع في ثوانٍ!</li>
              </ol>
            </div>

            {/* Dart Tab buttons */}
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveCodeTab('models')}
                className={`py-1.5 rounded-md text-[8px] sm:text-[9px] font-bold transition duration-200 text-center ${
                  activeCodeTab === 'models' 
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                نماذج Dart
              </button>
              <button
                onClick={() => setActiveCodeTab('service')}
                className={`py-1.5 rounded-md text-[8px] sm:text-[9px] font-bold transition duration-200 text-center ${
                  activeCodeTab === 'service' 
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                الربط والاتصال
              </button>
              <button
                onClick={() => setActiveCodeTab('ui')}
                className={`py-1.5 rounded-md text-[8px] sm:text-[9px] font-bold transition duration-200 text-center ${
                  activeCodeTab === 'ui' 
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                الواجهات UI
              </button>
              <button
                onClick={() => setActiveCodeTab('inventory_json')}
                className={`py-1.5 rounded-md text-[8px] sm:text-[9px] font-bold transition duration-200 text-center ${
                  activeCodeTab === 'inventory_json' 
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                تصدير المخزون JSON
              </button>
            </div>

            {/* File info, Download and Copy */}
            <div className="bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-t-xl flex justify-between items-center text-[10px] text-slate-300 font-mono">
              <span className="text-emerald-400 font-semibold">{getFileName()}</span>
              <div className="flex gap-1.5">
                {activeCodeTab === 'inventory_json' && (
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-350 hover:text-teal-300 px-2.5 py-1 rounded text-[9px] font-bold transition"
                  >
                    <Download size={11} className="text-teal-400" />
                    <span>تحميل JSON</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 bg-slate-900 border border-slate-750 hover:bg-slate-800 text-teal-400 hover:text-teal-300 px-2.5 py-1 rounded text-[9px] font-bold transition"
                >
                  {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  {copied ? 'تم النسخ!' : 'نسخ الكود'}
                </button>
              </div>
            </div>

            {/* Code Editor Preview */}
            <div className="h-60 bg-slate-950 p-2.5 rounded-b-xl border-x border-b border-slate-800 overflow-auto font-mono text-[9px] text-teal-200 text-left" style={{ direction: 'ltr' }}>
              <pre className="whitespace-pre">{getCode()}</pre>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM CONTROLS / SIMULATION BACKUP */}
        {activeSubTab === 'system' && (
          <div className="space-y-4 animate-fade-in">
            {anonymousAuthRestricted && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2 text-xs leading-relaxed text-amber-200">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Info size={14} />
                  <span>تنبيه: خاصية الدخول المجهول غير مفعلة بـ Firebase Console</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  يرجى تفعيل "تسجيل الدخول كمجهول" (Anonymous Sign-In) في لوحة تحكّم Firebase لتفعيل التزامن السحابي المباشر. يعمل التطبيق حالياً بسلاسة بالغة بوضع المزامنة الذاتية والتخزين المحلي حتى التفعيل.
                </p>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[9px] space-y-1.5 text-slate-300">
                  <p className="font-bold text-teal-400 mb-1">خطوات تشغيل التزامن السحابي المباشر:</p>
                  <ol className="list-decimal pr-1 space-y-1 text-[10px] space-y-1 text-slate-400 list-inside">
                    <li>افتح موقع <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-teal-450 underline hover:text-teal-400 font-bold">Firebase Console</a> لـ مشروعك</li>
                    <li>انتقل لـ <b>Authentication (الهوية)</b> في لوحة التحكم</li>
                    <li>اضغط على تبويب <b>Sign-in method (طرق تسجيل الدخول)</b></li>
                    <li>اضغط <b>Add new provider</b> واطلع على خيار <b>Anonymous</b> وقم بـ <b>تفعيله (Enable)</b></li>
                    <li>بعد حفظ الخطوة، ارجع للتطبيق وسيتم التزامن السحابي تلقائياً!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Database Simulation Mode card */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                {isOfflineSimulation ? (
                  <WifiOff size={14} className="text-amber-500 animate-pulse" />
                ) : (
                  <Wifi size={14} className="text-teal-400" />
                )}
                <span>محاكي الجلسة وحياد قواعد البيانات:</span>
              </h4>
              <p className="text-[10px] text-slate-350 leading-relaxed">
                التبديل بين الاتصال التلقائي بـ <b>Firestore السحابي</b> للتزامن الفوري عبر الهواتف، وبين وضع <b>Offline Local Storage</b> لحفظ بياناتك مؤقتا بالمتصفح في حال فقد الاتصال أو ضبط الأذونات بالخادم.
              </p>

              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] font-semibold text-slate-300">الوضع الحالي النشط:</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isOfflineSimulation ? 'bg-amber-500/10 text-amber-400' : 'bg-teal-500/10 text-teal-400'
                }`}>
                  {isOfflineSimulation ? 'تخزين محلي مجرب (Offline)' : 'تزامن Firestore حي (متصل)'}
                </span>
              </div>

              <button
                onClick={onToggleOffline}
                className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isOfflineSimulation 
                    ? 'bg-teal-500 hover:bg-teal-600 text-slate-950' 
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                <RefreshCw size={13} />
                تغيير وضع الاتصال ونقل العمليات
              </button>
            </div>

            {/* Factory Reset and seeding defaults */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <Trash2 size={14} />
                <span>إجراءات مسح البيانات الحرجة:</span>
              </h4>
              <p className="text-[10px] text-slate-350 leading-relaxed">
                تصفير كافة الحركات، فترات المبيعات وسجل الصيانة المحلي وإعادة تهيئة البرنامج مع الأصناف الرئيسية الافتراضية.
              </p>

              <button
                onClick={() => {
                  if (confirm('⚠️ هل أنت متأكد من تصفير ومسح كافة فواتير المبيعات، أصناف المخزن، وسجل الدردشة وإعادتها للافتراضية بالكامل؟')) {
                    onResetAllData();
                  }
                }}
                className="w-full bg-red-600/15 hover:bg-red-650/20 text-red-400 border border-red-500/15 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Sparkles size={13} />
                تصفير النظام وإعادة تحميل بضائع البداية الافتراضية
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
