import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, CheckCircle2, Ticket, CreditCard, Wallet, Coins } from 'lucide-react';
import { InventoryItem, SaleItem } from '../types';

interface SalesTabProps {
  inventory: InventoryItem[];
  onAddSale: (sale: SaleItem) => void;
  activeEmployee: string;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
  overridePrice?: number;
}

export default function SalesTab({ inventory, onAddSale, activeEmployee }: SalesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [isSuccess, setIsSuccess] = useState(false);

  // Available stock items for sale
  const saleableItems = inventory.filter(item => 
    item.stock > 0 && 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (item: InventoryItem) => {
    const existingIndex = cart.findIndex(c => c.item.id === item.id);
    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= item.stock) return; // Prevent exceeding stock
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { item, quantity: 1, overridePrice: item.price }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    const freshCart = cart.map(c => {
      if (c.item.id === itemId) {
        const validatedQty = Math.min(Math.max(1, qty), c.item.stock);
        return { ...c, quantity: validatedQty };
      }
      return c;
    });
    setCart(freshCart);
  };

  const updateCartPrice = (itemId: string, price: number) => {
    const freshCart = cart.map(c => {
      if (c.item.id === itemId) {
        return { ...c, overridePrice: price };
      }
      return c;
    });
    setCart(freshCart);
  };

  const totalAmount = cart.reduce((sum, c) => sum + (c.overridePrice ?? c.item.price) * c.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newSale: SaleItem = {
      id: 'sale_' + Date.now().toString(),
      items: cart.map(c => ({
        itemId: c.item.id,
        itemName: c.item.name,
        quantity: c.quantity,
        price: c.overridePrice ?? c.item.price
      })),
      totalAmount,
      paymentMethod,
      soldBy: activeEmployee,
      soldAt: new Date().toISOString(),
      customerName: customerName.trim() || undefined
    };

    onAddSale(newSale);
    setCart([]);
    setCustomerName('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="bg-slate-900 pb-1">
        <h3 className="text-sm font-bold text-slate-100">كاشير المبيعات وفواتير المحل</h3>
        <p className="text-[10px] text-slate-400">نقطة إصدار الفواتير الفورية وخصم المنتجات تلقائياً من الأجهزة</p>
      </div>

      {isSuccess && (
        <div className="bg-teal-500/10 border border-teal-500/20 p-3 rounded-xl flex items-center gap-2 text-teal-400 text-xs font-bold justify-center">
          <CheckCircle2 size={16} />
          <span>تم تسجيل المبيعات وخصم المخزون بنجاح فورياً! 🎉</span>
        </div>
      )}

      {/* Split layout: Selector vs Cart */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3 overflow-hidden">
        
        {/* Left column / Top: Item Selector */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden bg-slate-900/40 rounded-xl p-2 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-300">اختر السلعة للإضافة:</div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الموبايل أو الشاحن..."
              className="w-full bg-slate-850 text-slate-200 border border-slate-750 focus:border-teal-500 focus:outline-none rounded-lg pr-8 pl-2 py-1.5 text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search size={12} className="absolute right-2.5 top-2.5 text-slate-500" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {saleableItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">لا توجد بضائع متوفرة متطابقة.</div>
            ) : (
              saleableItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="w-full text-right bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 p-2 rounded-lg flex justify-between items-center text-xs transition"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-450 font-mono mt-0.5">سعر: {item.price} ج.م • موديل: {item.model}</div>
                  </div>
                  <span className="bg-teal-500/20 text-teal-400 font-extrabold px-2 py-1 rounded text-[10px]">
                    متاح: {item.stock}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right column / Bottom: Checkout Bill Cart */}
        <div className="w-full sm:w-[200px] md:w-[240px] flex flex-col bg-slate-850 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-350 flex items-center gap-1">
              <ShoppingCart size={13} className="text-teal-400" />
              سلة التسوّق والمبيعات
            </span>
            <span className="bg-slate-800 text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
              {cart.reduce((sum, c) => sum + c.quantity, 0)} قطع
            </span>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-[11px] text-slate-500">يرجى إضافة سلع لتحديد السعر وإصدار فاتورة لموظف المحل.</div>
            ) : (
              cart.map(cartItem => (
                <div key={cartItem.item.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-1">{cartItem.item.name}</span>
                    <button 
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="text-slate-450 hover:text-red-400 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-teal-400 font-mono">{(cartItem.overridePrice ?? cartItem.item.price) * cartItem.quantity} ج.م</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={cartItem.quantity}
                        onChange={(e) => updateCartQuantity(cartItem.item.id, parseInt(e.target.value) || 1)}
                        className="w-8 bg-slate-850 border border-slate-750 text-center font-mono rounded text-[10px] py-0.5 text-slate-150 focus:outline-none"
                      />
                      <span className="text-slate-500">حبة</span>
                    </div>
                  </div>

                  {/* Editable price per unit */}
                  <div className="flex justify-between items-center text-[10px] bg-slate-950 px-1.5 py-1 rounded">
                    <span className="text-[9px] text-slate-400 font-bold">تعديل سعر الحبة:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={cartItem.overridePrice ?? cartItem.item.price}
                        onChange={(e) => updateCartPrice(cartItem.item.id, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-850 border border-slate-750 text-center font-mono text-amber-400 rounded text-[10px] py-0.5 focus:border-amber-500 focus:outline-none font-bold"
                      />
                      <span className="text-slate-500 font-bold text-[9px]">ج.م</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & checkout details */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 text-xs space-y-2.5">
            <div>
              <label className="text-[10px] text-slate-450 block mb-1">اسم العميل (اختياري)</label>
              <input
                type="text"
                placeholder="عميل نقدي"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-slate-850 border border-slate-750 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
              />
            </div>

            {/* Payment options */}
            <div>
              <label className="text-[10px] text-slate-450 block mb-1">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-0.5 border ${
                    paymentMethod === 'cash' 
                      ? 'bg-teal-500/25 text-teal-300 border-teal-500/40' 
                      : 'bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <Coins size={10} /> كاش
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-0.5 border ${
                    paymentMethod === 'card' 
                      ? 'bg-teal-500/25 text-teal-300 border-teal-500/40' 
                      : 'bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <CreditCard size={10} /> شبكة
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-0.5 border ${
                    paymentMethod === 'wallet' 
                      ? 'bg-teal-500/25 text-teal-300 border-teal-500/40' 
                      : 'bg-slate-850 text-slate-400 border-transparent'
                  }`}
                >
                  <Wallet size={10} /> فودافون
                </button>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-2 flex justify-between items-center font-bold text-slate-100">
              <span>المجموع النهائي:</span>
              <span className="text-teal-400 font-mono text-[14px]">{totalAmount} ج.م</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-800 disabled:text-slate-450 text-slate-950 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition"
            >
              <Ticket size={14} />
              إصدار فاتورة وخصم فوري
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
