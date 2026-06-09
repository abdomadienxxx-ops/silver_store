import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Clock } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
  activeEmployee: string;
  onEmployeeChange: (name: string) => void;
  employees: string[];
  isOfflineSimulation?: boolean;
}

export default function PhoneContainer({
  children,
  activeEmployee,
  onEmployeeChange,
  employees,
  isOfflineSimulation = false
}: PhoneContainerProps) {
  const [currentMode, setCurrentMode] = useState<'mobile' | 'wide'>('mobile');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 md:p-6 font-sans">
      
      {/* Top Controller Header */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400 font-bold">
            📱
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-50">نظام إدارة محل الهواتف الذكية</h1>
            <p className="text-xs text-slate-400">تحديث فوري وقاعدة بيانات متزامنة لكل الموظفين</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Employee Swapper */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <span className="text-xs text-slate-400">الموظف الحالي:</span>
            <select
              value={activeEmployee}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="bg-transparent text-teal-400 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp} value={emp} className="bg-slate-900 text-slate-100">
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Screen Mode Swapper */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
            <button
              onClick={() => setCurrentMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition duration-200 ${
                currentMode === 'mobile'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone size={14} />
              هاتف ذكي
            </button>
            <button
              onClick={() => setCurrentMode('wide')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition duration-200 ${
                currentMode === 'wide'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={14} />
              شاشة كاملة
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="w-full flex justify-center items-center flex-1">
        {currentMode === 'mobile' ? (
          /* Phone Frame wrapper */
          <div className="relative w-[390px] h-[780px] bg-slate-905 border-[8px] border-slate-800 rounded-[48px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            {/* Phone Internal Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-3 h-3 bg-slate-900 rounded-full border-2 border-slate-950 mr-6"></div>
              <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
            </div>

            {/* Phone Status Bar */}
            <div className="h-10 bg-slate-900 flex items-center justify-between px-6 pt-2 select-none text-[11px] font-medium text-slate-300 z-10 animate-fade-in relative">
              <span className="flex items-center gap-1">
                <span>{currentTime}</span>
                {isOfflineSimulation && (
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/10 font-bold scale-90 select-none animate-pulse">
                    حفظ محلي مجرب 💾
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5">
                <Signal size={12} className={isOfflineSimulation ? "text-amber-400" : "text-teal-400"} />
                <Wifi size={12} className={isOfflineSimulation ? "text-amber-500/50" : "text-teal-400"} />
                <Battery size={13} className="text-teal-400" />
              </div>
            </div>

            {/* Scrollable Children Port */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
              {isOfflineSimulation && (
                <div className="bg-amber-600/10 border-b border-amber-600/15 py-1.5 px-3 text-[10px] text-amber-300 text-center select-none flex items-center justify-center gap-1 font-semibold">
                  <span>💡 وضع عمل احتياطي تلقائي:</span>
                  <span>تم تفعيل تخزين المتصفح الداخلي لضمان تجربة خالية من الأخطاء!</span>
                </div>
              )}
              {children}
            </div>

            {/* Virtual Home Bar */}
            <div className="h-5 bg-slate-900 flex items-center justify-center pb-1">
              <div className="w-32 h-1 bg-slate-600 rounded-indigo rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Responsive widescreen model */
          <div className="w-full max-w-5xl h-[720px] bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            {isOfflineSimulation && (
              <div className="bg-amber-600/15 border-b border-amber-600/20 py-2 px-4 text-xs text-amber-300 text-center flex items-center justify-center gap-2 font-medium">
                <span>⚡ وضع التشغيل الاحتياطي (Local Fallback):</span>
                <span>قاعدة البيانات محجوبة مؤقتاً بأذونات الحماية أو بحاجة للتوصيل. تم التبديل تلقائياً لحفظ البيانات بالجلسة المحلية لتبسيط تجربتك.</span>
              </div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Static Footer */}
      <p className="text-center text-[11px] text-slate-500 mt-4">
        تطبيق متصل بقاعدة بيانات سحابية متزامنة. للتجربة الفورية، افتح التطبيق في نافذة أخرى أو غير اسم الموظف لتسجيل بيانات متوازية.
      </p>
    </div>
  );
}
