import React, { useState } from 'react';
import { Search, PlusCircle, Wrench, PhoneCall, CheckCircle, Clock, UserCheck } from 'lucide-react';
import { RepairItem } from '../types';

interface RepairsTabProps {
  repairs: RepairItem[];
  onAddRepair: (repair: RepairItem) => void;
  onUpdateRepairStatus: (repairId: string, status: RepairItem['status'], cost: number) => void;
  activeEmployee: string;
}

export default function RepairsTab({
  repairs,
  onAddRepair,
  onUpdateRepairStatus,
  activeEmployee
}: RepairsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'delivered'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [cost, setCost] = useState('');

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          repair.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          repair.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deviceModel || !issueDescription) return;

    const newRepair: RepairItem = {
      id: 'repair_' + Date.now().toString(),
      customerName,
      customerPhone,
      deviceModel,
      issueDescription,
      status: 'pending',
      cost: parseFloat(cost) || 0,
      assignedTo: activeEmployee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddRepair(newRepair);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setDeviceModel('');
    setIssueDescription('');
    setCost('');
    setIsAdding(false);
  };

  const getStatusBadge = (status: RepairItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">مستلم / بانتظار فحص</span>;
      case 'in_progress':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">قيد الصيانة والفك</span>;
      case 'completed':
        return <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-bold">جاهز ومصلح ✅</span>;
      case 'delivered':
        return <span className="bg-slate-700/50 text-slate-350 border border-slate-700/30 px-2 py-0.5 rounded text-[10px] font-bold">تم تسليمه للعميل</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 pb-1">
        <div>
          <h3 className="text-sm font-bold text-slate-100">صيانة وهندسة الهواتف</h3>
          <p className="text-[10px] text-slate-400">تابع الأجهزة وقطع الغيار المعيبة للعملاء فورياً</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
        >
          <PlusCircle size={14} />
          استلام جهاز جديد
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-850 p-4 rounded-xl border border-amber-500/30 space-y-3">
          <div className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-1.5">استمارة جهاز صيانة فوري</div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">اسم العميل</label>
              <input
                type="text"
                placeholder="أحمد محمد"
                value={customerName}
                required
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">رقم تليفون العميل</label>
              <input
                type="text"
                placeholder="0123456789"
                value={customerPhone}
                required
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">موديل التليفون التالف</label>
              <input
                type="text"
                placeholder="Samsung S22 Ultra"
                value={deviceModel}
                required
                onChange={e => setDeviceModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">التكلفة المتوقعة (ج.م)</label>
              <input
                type="number"
                placeholder="50"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">وصف العطل في التليفون</label>
            <textarea
              placeholder="تبديل شاشة كاملة مكسورة أو شاحن لا يستجيب..."
              value={issueDescription}
              required
              rows={2}
              onChange={e => setIssueDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 rounded text-xs transition"
            >
              تسجيل جهاز بالصيانة
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 bg-slate-850 hover:bg-slate-750 text-slate-300 py-1.5 rounded text-xs transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Filters and search options */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث باسم العميل، التليفون، أو رقم للتواصل..."
            className="w-full bg-slate-850 text-slate-200 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute right-3 top-3 text-slate-500" />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              statusFilter === 'all' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            الكل ({repairs.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              statusFilter === 'pending' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            ⏳ بانتظار فحص
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              statusFilter === 'in_progress' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            🔧 قيد الصيانة
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              statusFilter === 'completed' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            ✅ مصلح وجاهز
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              statusFilter === 'delivered' 
                ? 'bg-slate-700/50 text-slate-300 border border-slate-700/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            🤝 تم تسليمه
          </button>
        </div>
      </div>

      {/* Repairs List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">لا توجد أجهزة صيانة تطابق بحثك حالياً.</div>
        ) : (
          filteredRepairs.map(repair => (
            <div
              key={repair.id}
              className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                    <Wrench size={12} className="text-amber-400" />
                    {repair.deviceModel}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">العميل: {repair.customerName} | {repair.customerPhone}</p>
                </div>
                <div>
                  {getStatusBadge(repair.status)}
                </div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded text-[10px] text-slate-350 border border-slate-800">
                {repair.issueDescription}
              </div>

              {/* Status workflow actions */}
              <div className="flex justify-between items-center border-t border-slate-800 pt-2.5 mt-1">
                <div className="text-[10px] text-slate-500">
                  فني المتابعة: <span className="text-slate-300">{repair.assignedTo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">التكلفة:</span>
                  <input
                    type="number"
                    value={repair.cost}
                    onChange={(e) => onUpdateRepairStatus(repair.id, repair.status, parseFloat(e.target.value) || 0)}
                    className="w-14 bg-slate-900 border border-slate-750 text-center font-mono rounded text-[11px] py-0.5 text-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">ج.م</span>

                  <select
                    value={repair.status}
                    onChange={(e) => onUpdateRepairStatus(repair.id, e.target.value as any, repair.cost)}
                    className="bg-slate-900 text-[10px] text-white border border-slate-750 rounded p-1 focus:outline-none cursor-pointer text-right"
                  >
                    <option value="pending">⏳ مستلم</option>
                    <option value="in_progress">🔧 مصلح</option>
                    <option value="completed">✅ جاهز</option>
                    <option value="delivered">🤝 مسلّم</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
