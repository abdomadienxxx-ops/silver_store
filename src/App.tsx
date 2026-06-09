import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, initializeAnonymousSession, handleFirestoreError, OperationType } from './lib/firebase';
import { InventoryItem, RepairItem, SaleItem, ChatMessage } from './types';

// Components
import PhoneContainer from './components/PhoneContainer';
import DashboardTab from './components/DashboardTab';
import InventoryTab from './components/InventoryTab';
import RepairsTab from './components/RepairsTab';
import SalesTab from './components/SalesTab';
import ChatTab from './components/ChatTab';
import SettingsTab from './components/SettingsTab';

// Icons for the bottom mobile navigation
import { LayoutDashboard, Package, Wrench, Receipt, MessageCircleCode, Settings } from 'lucide-react';

const TEAM_MEMBERS = [
  'عبدالرحمن (المدير)',
  'أحمد الفني (الصيانة)',
  'علي (الكاشير)'
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_iphone_15_pro',
    name: 'iPhone 15 Pro Max',
    category: 'phone',
    model: 'A3106',
    price: 1299,
    stock: 5,
    updatedBy: 'النظام',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item_galaxy_s24_ultra',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'phone',
    model: 'SM-S928B',
    price: 1199,
    stock: 4,
    updatedBy: 'النظام',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item_fast_charger_25w',
    name: 'شاحن سامسونج الأصلي 25 واط',
    category: 'accessory',
    model: 'EP-TA800',
    price: 25,
    stock: 25,
    updatedBy: 'النظام',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item_iphone_screen_13',
    name: 'شاشة iPhone 13 كاملة مع الفريم',
    category: 'spare_part',
    model: 'OLED HQ',
    price: 120,
    stock: 2,
    updatedBy: 'النظام',
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'phone', name: 'هواتف ذكية', icon: '📱' },
  { id: 'accessory', name: 'إكسسوارات', icon: '🔌' },
  { id: 'spare_part', name: 'قطع صيانة', icon: '🛠️' }
];

const DEFAULT_EMPLOYEES = [
  'عبدالرحمن (المدير)',
  'أحمد الفني (الصيانة)',
  'علي (الكاشير)'
];

export default function App() {
  const [activeEmployee, setActiveEmployee] = useState<string>(DEFAULT_EMPLOYEES[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'repairs' | 'sales' | 'chat' | 'settings'>('dashboard');
  
  // Realtime lists from Firestore database
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>(DEFAULT_CATEGORIES);
  const [employees, setEmployees] = useState<string[]>(DEFAULT_EMPLOYEES);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [authCompleted, setAuthCompleted] = useState<boolean>(false);
  const [isOfflineSimulation, setIsOfflineSimulation] = useState<boolean>(false);
  const [anonymousAuthRestricted, setAnonymousAuthRestricted] = useState<boolean>(false);

  // Default fallback data definition for robust client experience
  const INITIAL_REPAIRS: RepairItem[] = [
    {
      id: 'repair_1',
      customerName: 'محمد أحمد',
      customerPhone: '0501234567',
      deviceModel: 'iPhone 13',
      issueDescription: 'شاشة مكسورة وتحتاج استبدال كامل للشاشة مع الفحص',
      status: 'pending',
      cost: 150,
      assignedTo: 'أحمد الفني (الصيانة)',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'repair_2',
      customerName: 'فاطمة عمر',
      customerPhone: '0557654321',
      deviceModel: 'Samsung Galaxy S22',
      issueDescription: 'البطارية تفرغ بسرعة وتحتاج تغيير ببطارية أصلية وبث كفاءة الشحن',
      status: 'completed',
      cost: 85,
      assignedTo: 'أحمد الفني (الصيانة)',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ];

  const INITIAL_SALES: SaleItem[] = [
    {
      id: 'sale_1',
      customerName: 'عميل نقدي',
      items: [
        {
          itemId: 'item_fast_charger_25w',
          itemName: 'شاحن سامسونج الأصلي 25 واط',
          quantity: 2,
          price: 25
        }
      ],
      totalAmount: 50,
      paymentMethod: 'cash',
      soldBy: 'علي (الكاشير)',
      soldAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];

  const INITIAL_MESSAGES: ChatMessage[] = [
    {
      id: 'msg_1',
      text: 'يا شباب، شاشة آيفون 13 الأصلية متوفرة بالمستودع؟ 👍',
      senderName: 'أحمد الفني (الصيانة)',
      senderId: 'user_أحمد الفني (الصيانة)',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'msg_2',
      text: 'نعم متوفرة في درج رقم 3 بالمخزن يا أحمد 📦',
      senderName: 'عبدالرحمن (المدير)',
      senderId: 'user_عبدالرحمن (المدير)',
      timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString()
    }
  ];

  // Load local state fallback when running in offline/simulated fallback mode
  useEffect(() => {
    if (isOfflineSimulation) {
      console.warn("Firestore error or credential issue detected. Switching gracefully to Client-Side Local Storage Persistence...");
      
      const localInventory = localStorage.getItem('local_inventory');
      if (localInventory) {
        setInventory(JSON.parse(localInventory));
      } else {
        localStorage.setItem('local_inventory', JSON.stringify(INITIAL_INVENTORY));
        setInventory(INITIAL_INVENTORY);
      }

      const localRepairs = localStorage.getItem('local_repairs');
      if (localRepairs) {
        setRepairs(JSON.parse(localRepairs));
      } else {
        localStorage.setItem('local_repairs', JSON.stringify(INITIAL_REPAIRS));
        setRepairs(INITIAL_REPAIRS);
      }

      const localSales = localStorage.getItem('local_sales');
      if (localSales) {
        setSales(JSON.parse(localSales));
      } else {
        localStorage.setItem('local_sales', JSON.stringify(INITIAL_SALES));
        setSales(INITIAL_SALES);
      }

      const localMessages = localStorage.getItem('local_messages');
      if (localMessages) {
        setMessages(JSON.parse(localMessages));
      } else {
        localStorage.setItem('local_messages', JSON.stringify(INITIAL_MESSAGES));
        setMessages(INITIAL_MESSAGES);
      }

      const localCategories = localStorage.getItem('local_categories');
      if (localCategories) {
        setCategories(JSON.parse(localCategories));
      } else {
        localStorage.setItem('local_categories', JSON.stringify(DEFAULT_CATEGORIES));
        setCategories(DEFAULT_CATEGORIES);
      }

      const localEmployees = localStorage.getItem('local_employees');
      if (localEmployees) {
        setEmployees(JSON.parse(localEmployees));
      } else {
        localStorage.setItem('local_employees', JSON.stringify(DEFAULT_EMPLOYEES));
        setEmployees(DEFAULT_EMPLOYEES);
      }

      setLoading(false);
    }
  }, [isOfflineSimulation]);

  // Authenticate user anonymously to satisfy secure firestore rules
  useEffect(() => {
    async function setupAppSession() {
      try {
        const user = await initializeAnonymousSession();
        if (!user) {
          console.warn("Anonymous registration is disabled or restricted. Switching to Client-Side persistence.");
          setIsOfflineSimulation(true);
          setAnonymousAuthRestricted(true);
        }
      } catch (err) {
        console.warn("Anonymous auth failed, fallback enabled.", err);
        setIsOfflineSimulation(true);
        setAnonymousAuthRestricted(true);
      }
      setAuthCompleted(true);
    }
    setupAppSession();
  }, []);

  // Subscribe to real-time sync databases
  useEffect(() => {
    if (!authCompleted || isOfflineSimulation) return;

    // 1. Inventory Catalog Sync listener
    const unsubscribeInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });

      // Seed database with beautiful defaults if completely clean/empty on first start
      if (items.length === 0 && loading) {
        INITIAL_INVENTORY.forEach(async (defaultItem) => {
          try {
            await setDoc(doc(db, 'inventory', defaultItem.id), {
              name: defaultItem.name,
              category: defaultItem.category,
              model: defaultItem.model,
              price: defaultItem.price,
              stock: defaultItem.stock,
              updatedBy: defaultItem.updatedBy,
              updatedAt: defaultItem.updatedAt
            });
          } catch (e) {
            console.error("Error seeding default catalog item:", e);
          }
        });
      } else {
        setInventory(items);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore collection inventory access restricted. Activating client-side fallback mode.");
      setIsOfflineSimulation(true);
    });

    // 2. Repairs Workbench Sync listener
    const unsubscribeRepairs = onSnapshot(collection(db, 'repairs'), (snapshot) => {
      const repairItems: RepairItem[] = [];
      snapshot.forEach((doc) => {
        repairItems.push({ id: doc.id, ...doc.data() } as RepairItem);
      });
      // Sort repairs: pending first, then chronologically
      repairItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRepairs(repairItems);
    }, (error) => {
      console.warn("Firestore collection repairs access restricted. Activating client-side fallback mode.");
      setIsOfflineSimulation(true);
    });

    // 3. Register Sales Invoices Sync listener
    const unsubscribeSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const saleItems: SaleItem[] = [];
      snapshot.forEach((doc) => {
        saleItems.push({ id: doc.id, ...doc.data() } as SaleItem);
      });
      saleItems.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());
      setSales(saleItems);
    }, (error) => {
      console.warn("Firestore collection sales access restricted. Activating client-side fallback mode.");
      setIsOfflineSimulation(true);
    });

    // 4. Employee Instant Chats Sync listener (limit to last 50)
    const qMessages = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const msgItems: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgItems.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgItems);
    }, (error) => {
      console.warn("Firestore collection messages access restricted. Activating client-side fallback mode.");
      setIsOfflineSimulation(true);
    });

    // 5. Dynamic Categories Sync listener
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const catsList: any[] = [];
      snapshot.forEach((doc) => {
        catsList.push({ id: doc.id, ...doc.data() });
      });
      if (catsList.length > 0) {
        setCategories(catsList);
      } else if (loading) {
        // seed
        DEFAULT_CATEGORIES.forEach(async (cat) => {
          try {
            await setDoc(doc(db, 'categories', cat.id), { name: cat.name, icon: cat.icon });
          } catch (e) {
            console.error(e);
          }
        });
        setCategories(DEFAULT_CATEGORIES);
      }
    }, (err) => {
      console.warn("Categories subscription error, continuing with fallback.");
    });

    // 6. Dynamic Employees Sync listener
    const unsubscribeEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const empsList: string[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d && d.name) {
          empsList.push(d.name);
        }
      });
      if (empsList.length > 0) {
        setEmployees(empsList);
      } else if (loading) {
        // seed
        DEFAULT_EMPLOYEES.forEach(async (emp) => {
          try {
            await setDoc(doc(db, 'employees', emp), { name: emp });
          } catch (e) {
            console.error(e);
          }
        });
        setEmployees(DEFAULT_EMPLOYEES);
      }
    }, (err) => {
      console.warn("Employees subscription error, continuing with fallback.");
    });

    return () => {
      unsubscribeInventory();
      unsubscribeRepairs();
      unsubscribeSales();
      unsubscribeMessages();
      unsubscribeCategories();
      unsubscribeEmployees();
    };
  }, [authCompleted, isOfflineSimulation, loading]);

  // Database operation callbacks
  const handleAddStock = async (newItem: InventoryItem) => {
    if (isOfflineSimulation) {
      const updated = [newItem, ...inventory];
      setInventory(updated);
      localStorage.setItem('local_inventory', JSON.stringify(updated));
      return;
    }
    try {
      await setDoc(doc(db, 'inventory', newItem.id), {
        name: newItem.name,
        category: newItem.category,
        model: newItem.model,
        price: newItem.price,
        stock: newItem.stock,
        updatedBy: newItem.updatedBy,
        updatedAt: newItem.updatedAt
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inventory/${newItem.id}`);
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    if (isOfflineSimulation) {
      const updated = inventory.map(item => item.id === itemId ? {
        ...item,
        stock: newStock,
        updatedBy: activeEmployee,
        updatedAt: new Date().toISOString()
      } : item);
      setInventory(updated);
      localStorage.setItem('local_inventory', JSON.stringify(updated));
      return;
    }
    try {
      await updateDoc(doc(db, 'inventory', itemId), {
        stock: newStock,
        updatedBy: activeEmployee,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${itemId}`);
    }
  };

  const handleAddRepair = async (newRepair: RepairItem) => {
    if (isOfflineSimulation) {
      const updated = [newRepair, ...repairs];
      setRepairs(updated);
      localStorage.setItem('local_repairs', JSON.stringify(updated));
      await handleSendMessage(`📢 استلمت تليفون صيانة جديد: ${newRepair.deviceModel} للعميل ${newRepair.customerName}`);
      return;
    }
    try {
      await setDoc(doc(db, 'repairs', newRepair.id), {
        customerName: newRepair.customerName,
        customerPhone: newRepair.customerPhone,
        deviceModel: newRepair.deviceModel,
        issueDescription: newRepair.issueDescription,
        status: newRepair.status,
        cost: newRepair.cost,
        assignedTo: newRepair.assignedTo,
        createdAt: newRepair.createdAt,
        updatedAt: newRepair.updatedAt
      });

      // Auto notify employees on group chat
      await handleSendMessage(`📢 استلمت تليفون صيانة جديد: ${newRepair.deviceModel} للعميل ${newRepair.customerName}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `repairs/${newRepair.id}`);
    }
  };

  const handleUpdateRepairStatus = async (repairId: string, status: RepairItem['status'], cost: number) => {
    const currentRepair = repairs.find(r => r.id === repairId);
    if (isOfflineSimulation) {
      const updated = repairs.map(rep => rep.id === repairId ? {
        ...rep,
        status,
        cost,
        updatedAt: new Date().toISOString()
      } : rep);
      setRepairs(updated);
      localStorage.setItem('local_repairs', JSON.stringify(updated));

      if (currentRepair && currentRepair.status !== status) {
        let arabicStatus = '';
        if (status === 'in_progress') arabicStatus = 'قيد العمل بالصيانة - الفك والتركيب 🛠️';
        if (status === 'completed') arabicStatus = 'تم الإصلاح وصار جاهز للتسليم! ✅';
        if (status === 'delivered') arabicStatus = 'تم التسليم واستلام التكلفة 💰';
        await handleSendMessage(`🔧 تم تعديل حالة تليفون ${currentRepair.deviceModel} للعميل ${currentRepair.customerName} إلى: [${arabicStatus}] بقيمة ${cost} ج.م`);
      }
      return;
    }
    try {
      await updateDoc(doc(db, 'repairs', repairId), {
        status,
        cost,
        updatedAt: new Date().toISOString()
      });
      
      // Auto notify on completion/delivery status transitions on chat
      if (currentRepair && currentRepair.status !== status) {
        let arabicStatus = '';
        if (status === 'in_progress') arabicStatus = 'قيد العمل بالصيانة الفك';
        if (status === 'completed') arabicStatus = 'تم الإصلاح وصار جاهز للتسليم! ✅';
        if (status === 'delivered') arabicStatus = 'تم التسليم من المخزن واستلام التكلفة';
        
        await handleSendMessage(`🔧 تم تعديل حالة تليفون ${currentRepair.deviceModel} للعميل ${currentRepair.customerName} إلى: [${arabicStatus}] بقيمة ${cost} ج.م`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `repairs/${repairId}`);
    }
  };

  const handleAddSale = async (newSale: SaleItem) => {
    if (isOfflineSimulation) {
      const updatedSales = [newSale, ...sales];
      setSales(updatedSales);
      localStorage.setItem('local_sales', JSON.stringify(updatedSales));

      const updatedInventory = inventory.map(item => {
        const cartMatch = newSale.items.find(c => c.itemId === item.id);
        if (cartMatch) {
          return {
            ...item,
            stock: Math.max(0, item.stock - cartMatch.quantity),
            updatedBy: activeEmployee,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      setInventory(updatedInventory);
      localStorage.setItem('local_inventory', JSON.stringify(updatedInventory));

      const saleDetailsText = newSale.items.map(i => `${i.itemName} (عدد x${i.quantity})`).join('، ');
      await handleSendMessage(`💰 مبيعات جديدة! تم بيع: [ ${saleDetailsText} ] بقيمة إجمالية ${newSale.totalAmount} ج.م بواسطة الموظف ${newSale.soldBy}`);
      return;
    }
    try {
      // 1. Record POS Invoice transaction
      await setDoc(doc(db, 'sales', newSale.id), {
        items: newSale.items,
        totalAmount: newSale.totalAmount,
        paymentMethod: newSale.paymentMethod,
        soldBy: newSale.soldBy,
        soldAt: newSale.soldAt,
        customerName: newSale.customerName || 'عميل نقدي'
      });

      // 2. Real-time decrement warehouse inventory levels for each item purchased (Transaction style)
      newSale.items.forEach(async (cartItem) => {
        const inventoryMatch = inventory.find(i => i.id === cartItem.itemId);
        if (inventoryMatch) {
          const calculatedRemainingStock = Math.max(0, inventoryMatch.stock - cartItem.quantity);
          await updateDoc(doc(db, 'inventory', cartItem.itemId), {
            stock: calculatedRemainingStock,
            updatedBy: activeEmployee,
            updatedAt: new Date().toISOString()
          });
        }
      });

      // 3. Log sales item report to group channel
      const saleDetailsText = newSale.items.map(i => `${i.itemName} (عدد x${i.quantity})`).join('، ');
      await handleSendMessage(`💰 مبيعات جديدة! تم بيع: [ ${saleDetailsText} ] بقيمة إجمالية ${newSale.totalAmount} ج.م بواسطة الموظف ${newSale.soldBy}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sales/${newSale.id}`);
    }
  };

  const handleSendMessage = async (rawMessageText: string) => {
    if (isOfflineSimulation) {
      const newMsg: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        text: rawMessageText,
        senderName: activeEmployee,
        senderId: 'user_' + activeEmployee,
        timestamp: new Date().toISOString()
      };
      const updated = [newMsg, ...messages];
      setMessages(updated);
      localStorage.setItem('local_messages', JSON.stringify(updated));
      return;
    }
    try {
      await addDoc(collection(db, 'messages'), {
        text: rawMessageText,
        senderName: activeEmployee,
        senderId: 'user_' + activeEmployee,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const handleAddCategory = async (id: string, name: string, icon: string) => {
    if (isOfflineSimulation) {
      const updated = [...categories, { id, name, icon }];
      setCategories(updated);
      localStorage.setItem('local_categories', JSON.stringify(updated));
      return;
    }
    try {
      await setDoc(doc(db, 'categories', id), { name, icon });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (isOfflineSimulation) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('local_categories', JSON.stringify(updated));
      return;
    }
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleAddEmployee = async (name: string) => {
    if (isOfflineSimulation) {
      const updated = [...employees, name];
      setEmployees(updated);
      localStorage.setItem('local_employees', JSON.stringify(updated));
      return;
    }
    try {
      await setDoc(doc(db, 'employees', name), { name });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `employees/${name}`);
    }
  };

  const handleDeleteEmployee = async (name: string) => {
    if (isOfflineSimulation) {
      const updated = employees.filter(e => e !== name);
      setEmployees(updated);
      localStorage.setItem('local_employees', JSON.stringify(updated));
      if (activeEmployee === name && updated.length > 0) {
        setActiveEmployee(updated[0]);
      }
      return;
    }
    try {
      await deleteDoc(doc(db, 'employees', name));
      if (activeEmployee === name) {
        const rest = employees.filter(e => e !== name);
        if (rest.length > 0) {
          setActiveEmployee(rest[0]);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `employees/${name}`);
    }
  };

  const handleResetAllData = () => {
    localStorage.removeItem('local_inventory');
    localStorage.removeItem('local_repairs');
    localStorage.removeItem('local_sales');
    localStorage.removeItem('local_messages');
    localStorage.removeItem('local_categories');
    localStorage.removeItem('local_employees');

    setInventory(INITIAL_INVENTORY);
    setRepairs(INITIAL_REPAIRS);
    setSales(INITIAL_SALES);
    setMessages(INITIAL_MESSAGES);
    setCategories(DEFAULT_CATEGORIES);
    setEmployees(DEFAULT_EMPLOYEES);

    setIsOfflineSimulation(true);
  };

  const renderActiveTab = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center text-slate-400 font-sans p-6 text-center select-none">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-sm font-bold text-slate-100">تحميل البيانات والمزامنة الفورية...</div>
          <div className="text-xs mt-1 text-slate-400">يربط الأجهزة بقاعدة البيانات السحابية</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            inventory={inventory}
            repairs={repairs}
            sales={sales}
            activeEmployee={activeEmployee}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            inventory={inventory}
            onAddStock={handleAddStock}
            onUpdateStock={handleUpdateStock}
            activeEmployee={activeEmployee}
            categories={categories}
          />
        );
      case 'repairs':
        return (
          <RepairsTab
            repairs={repairs}
            onAddRepair={handleAddRepair}
            onUpdateRepairStatus={handleUpdateRepairStatus}
            activeEmployee={activeEmployee}
          />
        );
      case 'sales':
        return (
          <SalesTab
            inventory={inventory}
            onAddSale={handleAddSale}
            activeEmployee={activeEmployee}
          />
        );
      case 'chat':
        return (
          <ChatTab
            messages={messages}
            onSendMessage={handleSendMessage}
            activeEmployee={activeEmployee}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            isOfflineSimulation={isOfflineSimulation}
            onToggleOffline={() => setIsOfflineSimulation(!isOfflineSimulation)}
            onResetAllData={handleResetAllData}
            anonymousAuthRestricted={anonymousAuthRestricted}
            inventory={inventory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PhoneContainer
      activeEmployee={activeEmployee}
      onEmployeeChange={setActiveEmployee}
      employees={employees}
      isOfflineSimulation={isOfflineSimulation}
    >
      {/* Scrollable contents according to active menu tabs */}
      {renderActiveTab()}

      {/* Styled Responsive Bottom Navigation Bar */}
      <div className="h-14 bg-slate-950 border-t border-slate-850 grid grid-cols-6 items-center px-1 text-center font-semibold select-none z-10">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'dashboard' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <LayoutDashboard size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'inventory' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Package size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">المخزون</span>
        </button>

        <button
          onClick={() => setActiveTab('repairs')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'repairs' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Wrench size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">الصيانة</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'sales' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Receipt size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">المبيعات</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'chat' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <MessageCircleCode size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">الدردشة</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'settings' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Settings size={16} />
          <span className="text-[8px] mt-1 font-medium scale-95">الاعدادات</span>
        </button>
      </div>
    </PhoneContainer>
  );
}
