import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Package, ShieldAlert, Wrench, Users, Clock } from 'lucide-react';
import { InventoryItem, RepairItem, SaleItem } from '../types';

interface DashboardTabProps {
  inventory: InventoryItem[];
  repairs: RepairItem[];
  sales: SaleItem[];
  activeEmployee: string;
}

export default function DashboardTab({ inventory, repairs, sales, activeEmployee }: DashboardTabProps) {
  // Calculators
  const totalSalesCost = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const activeRepairs = repairs.filter(r => r.status === 'pending' || r.status === 'in_progress');
  const finishedRepairs = repairs.filter(r => r.status === 'completed');

  const lowStockItems = inventory.filter(i => i.stock <= 3);

  // Categories helper
  const totalPhones = inventory.filter(i => i.category === 'phone').reduce((sum, s) => sum + s.stock, 0);
  const totalAccessories = inventory.filter(i => i.category === 'accessory').reduce((sum, s) => sum + s.stock, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 rtl select-none" style={{ direction: 'rtl' }}>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-slate-900 to-teal-950 p-4 rounded-xl border border-teal-900/30">
        <h2 className="text-base font-bold text-teal-400">مرحباً بك، {activeEmployee}! 👋</h2>
        <p className="text-xs text-slate-300 mt-1">
          إليك ملخص شامل وفوري لحالة المحل اليوم. جميع الموظفين يشاهدون نفس الأرقام لحظة بلحظة.
        </p>
      </div>

      {/* Grid of 3 counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-teal-400 bg-teal-500/10 w-7 h-7 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">إجمالي المبيعات</div>
            <div className="text-sm font-bold text-white mt-0.5">{totalSalesCost.toLocaleString()} ج.م</div>
          </div>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-amber-400 bg-amber-400/10 w-7 h-7 rounded-lg flex items-center justify-center mb-2">
            <Wrench size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">أعطال الصيانة</div>
            <div className="text-sm font-bold text-white mt-0.5">{activeRepairs.length} أجهزة</div>
          </div>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-red-400 bg-red-400/10 w-7 h-7 rounded-lg flex items-center justify-center mb-2">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">نواقص الرفوف</div>
            <div className="text-sm font-bold text-white mt-0.5">{lowStockItems.length} أصناف</div>
          </div>
        </div>
      </div>

      {/* Live Graph Sim */}
      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <span>توزيع مخزون المحل الحالي</span>
        </h3>
        <div className="space-y-2.5">
          {/* Phones inventory view */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>الهواتف الذكية</span>
              <span className="font-mono text-teal-400 font-bold">{totalPhones} هاتف</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalPhones / 100) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Accessories review */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>الإكسسوارات والشواحن</span>
              <span className="font-mono text-amber-500 font-bold">{totalAccessories} قطعة</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalAccessories / 150) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Repairs Quick Radar */}
      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 mb-3">حالات هواتف العملاء بالصيانة</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-rose-400 font-bold block text-lg font-mono">{activeRepairs.length}</span>
            <span className="text-slate-400 text-[10px]">قيد الإصلاح أو الانتظار</span>
          </div>
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block text-lg font-mono">{finishedRepairs.length}</span>
            <span className="text-slate-400 text-[10px]">جاهز للتسليم للعملاء</span>
          </div>
        </div>
      </div>

      {/* Low Stock Checklist alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1.5">
            <ShieldAlert size={14} />
            <span>تنبيه نواقص المخزون (أقل من ٣ قطع) :</span>
          </div>
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
            {lowStockItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-200 font-medium">{item.name} ({item.model})</span>
                <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  متبقي: {item.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invoices Log */}
      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
          <span>آخر المبيعات والفواتير</span>
          <span className="text-[10px] text-slate-400">تحديث فوري</span>
        </h3>
        {sales.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">لا توجد مبيعات مسجلة حتى الآن اليوم.</div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-slate-200">
                    {sale.items.length === 1 
                      ? sale.items[0].itemName 
                      : `${sale.items[0].itemName} و ${sale.items.length - 1} قطع أخرى`}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>البائع: {sale.soldBy}</span>
                    <span>•</span>
                    <span>{new Date(sale.soldAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>
                <div className="text-teal-400 font-mono font-extrabold text-[13px]">
                  +{sale.totalAmount} ج.م
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
