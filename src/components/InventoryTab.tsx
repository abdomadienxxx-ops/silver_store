import React, { useState } from 'react';
import { Plus, Minus, Search, Tag, Phone, ShoppingBag, PlusCircle, PenTool } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onAddStock: (item: InventoryItem) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
  activeEmployee: string;
  categories: { id: string; name: string; icon: string }[];
}

export default function InventoryTab({
  inventory,
  onAddStock,
  onUpdateStock,
  activeEmployee,
  categories
}: InventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('phone');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    const newItem: InventoryItem = {
      id: 'item_' + Date.now().toString(),
      name,
      category,
      model: model || 'N/A',
      price: parseFloat(price),
      stock: parseInt(stock),
      updatedBy: activeEmployee,
      updatedAt: new Date().toISOString()
    };

    onAddStock(newItem);

    // Reset Form
    setName('');
    setModel('');
    setPrice('');
    setStock('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4" style={{ direction: 'rtl' }}>
      
      {/* Tab bar header */}
      <div className="flex justify-between items-center bg-slate-900 pb-1">
        <div>
          <h3 className="text-sm font-bold text-slate-100">مخزن البضائع والهواتف</h3>
          <p className="text-[10px] text-slate-400">تعديل فوري لقوائم الأسعار والمخزون</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
        >
          <PlusCircle size={14} />
          إضافة صنف منفصل
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-850 p-4 rounded-xl border border-teal-500/20 space-y-3">
          <div className="text-xs font-bold text-teal-400 border-b border-slate-800 pb-1.5">توريد صنف جديد إلى الرفوف</div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">اسم الصنف (شاشة، آيفون، إلخ)</label>
              <input
                type="text"
                placeholder="مثال: iPhone 13 Pro"
                value={name}
                required
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">القسم</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">الموديل</label>
              <input
                type="text"
                placeholder="A2633"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">السعر (ج.م)</label>
              <input
                type="number"
                placeholder="999"
                value={price}
                required
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">الكمية</label>
              <input
                type="number"
                placeholder="10"
                value={stock}
                required
                onChange={e => setStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-1.5 rounded text-xs transition"
            >
              حفظ وتوريد فوري
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 bg-slate-800 hover:bg-slate-705 text-slate-300 py-1.5 rounded text-xs transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter tools */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث عن منتج أو كود فني..."
            className="w-full bg-slate-850 text-slate-200 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute right-3 top-3 text-slate-500" />
        </div>

        {/* Categories selectors */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
              categoryFilter === 'all' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                : 'bg-slate-850 text-slate-400 border border-transparent'
            }`}
          >
            الكل ({inventory.length})
          </button>
          {categories.map(cat => {
            const count = inventory.filter(item => item.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat.id 
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                    : 'bg-slate-850 text-slate-400 border border-transparent'
                }`}
              >
                {cat.icon} {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stock Products List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">لا توجد عناصر تطابق بحثك حالياً.</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex justify-between items-center gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-750 flex items-center justify-center text-lg animate-fade-in">
                  {categories.find(c => c.id === item.category)?.icon ?? '📦'}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-100">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    موديل: <span className="font-mono text-slate-300">{item.model}</span> | السعر: <span className="text-teal-400 font-bold">{item.price} ج.م</span>
                  </div>
                  <div className="text-[9px] text-slate-450 mt-1">
                    القسم: {categories.find(c => c.id === item.category)?.name || 'عام'} | آخر تحديث من: {item.updatedBy || 'المشرف'}
                  </div>
                </div>
              </div>

              {/* Live stock state control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                  className="w-7 h-7 bg-slate-900 hover:bg-slate-750 text-slate-300 border border-slate-850 rounded-lg flex items-center justify-center transition"
                >
                  <Minus size={12} />
                </button>
                
                <div className={`w-8 text-center text-xs font-mono font-bold ${item.stock <= 3 ? 'text-red-400 bg-red-400/10 px-1.5 py-1 rounded' : 'text-slate-100'}`}>
                  {item.stock}
                </div>

                <button
                  onClick={() => onUpdateStock(item.id, item.stock + 1)}
                  className="w-7 h-7 bg-slate-900 hover:bg-slate-750 text-teal-400 border border-slate-850 rounded-lg flex items-center justify-center transition"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
