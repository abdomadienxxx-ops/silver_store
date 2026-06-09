export const FLUTTER_DART_TEMPLATE_MODELS = `// models.dart
// تمثيل البيانات لتطبيق إدارة محل الهواتف (الهواتف، الأكسسوارات، الصيانة، والمبيعات)

import 'package:cloud_firestore/cloud_firestore.dart';

class InventoryItem {
  final String id;
  final String name;
  final String category; // 'phone', 'accessory', 'spare_part'
  final String model;
  final double price;
  final int stock;
  final String? image;
  final String updatedBy;
  final DateTime updatedAt;

  InventoryItem({
    required this.id,
    required this.name,
    required this.category,
    required this.model,
    required this.price,
    required this.stock,
    this.image,
    required this.updatedBy,
    required this.updatedAt,
  });

  factory InventoryItem.fromMap(Map<String, dynamic> data, String documentId) {
    return InventoryItem(
      id: documentId,
      name: data['name'] ?? '',
      category: data['category'] ?? 'phone',
      model: data['model'] ?? '',
      price: (data['price'] ?? 0.0).toDouble(),
      stock: (data['stock'] ?? 0).toInt(),
      image: data['image'],
      updatedBy: data['updatedBy'] ?? '',
      updatedAt: data['updatedAt'] != null 
          ? (data['updatedAt'] as Timestamp).toDate() 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'category': category,
      'model': model,
      'price': price,
      'stock': stock,
      'image': image,
      'updatedBy': updatedBy,
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}

class RepairItem {
  final String id;
  final String customerName;
  final String customerPhone;
  final String deviceModel;
  final String issueDescription;
  final String status; // 'pending', 'in_progress', 'completed', 'delivered'
  final double cost;
  final String assignedTo;
  final DateTime createdAt;
  final DateTime updatedAt;

  RepairItem({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    required this.deviceModel,
    required this.issueDescription,
    required this.status,
    required this.cost,
    required this.assignedTo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RepairItem.fromMap(Map<String, dynamic> data, String documentId) {
    return RepairItem(
      id: documentId,
      customerName: data['customerName'] ?? '',
      customerPhone: data['customerPhone'] ?? '',
      deviceModel: data['deviceModel'] ?? '',
      issueDescription: data['issueDescription'] ?? '',
      status: data['status'] ?? 'pending',
      cost: (data['cost'] ?? 0.0).toDouble(),
      assignedTo: data['assignedTo'] ?? '',
      createdAt: data['createdAt'] != null 
          ? (data['createdAt'] as Timestamp).toDate() 
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null 
          ? (data['updatedAt'] as Timestamp).toDate() 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'customerName': customerName,
      'customerPhone': customerPhone,
      'deviceModel': deviceModel,
      'issueDescription': issueDescription,
      'status': status,
      'cost': cost,
      'assignedTo': assignedTo,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}

class SaleItem {
  final String id;
  final List<Map<String, dynamic>> items;
  final double totalAmount;
  final String paymentMethod;
  final String soldBy;
  final DateTime soldAt;
  final String? customerName;

  SaleItem({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.paymentMethod,
    required this.soldBy,
    required this.soldAt,
    this.customerName,
  });

  factory SaleItem.fromMap(Map<String, dynamic> data, String documentId) {
    return SaleItem(
      id: documentId,
      items: List<Map<String, dynamic>>.from(data['items'] ?? []),
      totalAmount: (data['totalAmount'] ?? 0.0).toDouble(),
      paymentMethod: data['paymentMethod'] ?? 'cash',
      soldBy: data['soldBy'] ?? '',
      soldAt: data['soldAt'] != null 
          ? (data['soldAt'] as Timestamp).toDate() 
          : DateTime.now(),
      customerName: data['customerName'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'items': items,
      'totalAmount': totalAmount,
      'paymentMethod': paymentMethod,
      'soldBy': soldBy,
      'soldAt': Timestamp.fromDate(soldAt),
      'customerName': customerName,
    };
  }
}

class ChatMessage {
  final String id;
  final String text;
  final String senderName;
  final String senderId;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.text,
    required this.senderName,
    required this.senderId,
    required this.timestamp,
  });

  factory ChatMessage.fromMap(Map<String, dynamic> data, String documentId) {
    return ChatMessage(
      id: documentId,
      text: data['text'] ?? '',
      senderName: data['senderName'] ?? '',
      senderId: data['senderId'] ?? '',
      timestamp: data['timestamp'] != null 
          ? (data['timestamp'] as Timestamp).toDate() 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'text': text,
      'senderName': senderName,
      'senderId': senderId,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }
}
`;

export const FLUTTER_DART_TEMPLATE_SERVICE = `// firestore_service.dart
// خدمة الاتصال بقاعدة البيانات فيرماب مع تحديثات فورية متزامنة تلقائياً لجميع الأجهزة

import 'package:cloud_firestore/cloud_firestore.dart';
import 'models.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --- إدارة المخزون (Inventory) ---
  
  // دفق حي فوري للمخزون
  Stream<List<InventoryItem>> streamInventory() {
    return _db.collection('inventory').snapshots().map((snapshot) =>
        snapshot.docs.map((doc) => InventoryItem.fromMap(doc.data(), doc.id)).toList());
  }

  // إضافة أو تحديث منتج بالمخزون
  Future<void> saveInventoryItem(InventoryItem item) {
    return _db.collection('inventory').doc(item.id.isEmpty ? null : item.id).set(
          item.toMap(),
          SetOptions(merge: true),
        );
  }

  // حذف منتج
  Future<void> deleteInventoryItem(String id) {
    return _db.collection('inventory').doc(id).delete();
  }

  // --- تتبع الصيانة (Repairs) ---

  // دفق حي ومباشر لجميع عمليات الصيانة للموظفين
  Stream<List<RepairItem>> streamRepairs() {
    return _db.collection('repairs')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => RepairItem.fromMap(doc.data(), doc.id)).toList());
  }

  // إضافة صيانة جديدة
  Future<void> createRepair(RepairItem repair) {
    return _db.collection('repairs').add(repair.toMap());
  }

  // تحديث حالة الصيانة (بشكل فوري يظهر للكل)
  Future<void> updateRepairStatus(String id, String status, double cost) {
    return _db.collection('repairs').doc(id).update({
      'status': status,
      'cost': cost,
      'updatedAt': Timestamp.now(),
    });
  }

  // --- معالجة المبيعات وفواتير نقاط البيع (Sales) ---

  // دفق للمبيعات اليومية
  Stream<List<SaleItem>> streamSales() {
    return _db.collection('sales')
        .orderBy('soldAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => SaleItem.fromMap(doc.data(), doc.id)).toList());
  }

  // إجراء معاملة بيع مع تنزيل الكمية من المخزون فورياً داخل معاملة آمنة (Transaction)
  Future<void> processSale(SaleItem sale) async {
    final batch = _db.batch();
    
    // تسجيل الفاتورة
    final saleDocRef = _db.collection('sales').doc();
    batch.set(saleDocRef, sale.toMap());

    // خصم المخزون لكل منتج تم بيعه
    for (var item in sale.items) {
      final itemDocRef = _db.collection('inventory').doc(item['itemId']);
      batch.update(itemDocRef, {
        'stock': FieldValue.increment(-item['quantity']),
      });
    }

    await batch.commit();
  }

  // --- الدردشة والنشاط الحي للموظفين (Chat/Activity Feed) ---

  // دفق المحادثات الفوري
  Stream<List<ChatMessage>> streamMessages() {
    return _db.collection('messages')
        .orderBy('timestamp', descending: true)
        .limit(100)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => ChatMessage.fromMap(doc.data(), doc.id)).toList());
  }

  // إرسال رسالة فورية تظهر لجميع أجهزة الموظفين في نفس اللحظة
  Future<void> sendMessage(String text, String senderName, String senderId) {
    return _db.collection('messages').add({
      'text': text,
      'senderName': senderName,
      'senderId': senderId,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }
}
`;

export const FLUTTER_DART_TEMPLATE_UI = `// main.dart
// واجهة التطبيق المتجاوبة للهواتف الذكية مع تصميم مصقول باللغة العربية

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'models.dart';
import 'firestore_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(); // تأكد من تكوين firebase_options.dart
  runApp(const PhoneShopApp());
}

class PhoneShopApp extends StatelessWidget {
  const PhoneShopApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'إدارة محل الهواتف',
      locale: const Locale('ar', 'EG'),
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.teal,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        fontFamily: 'Tajawal', // خط عربي مميز للمبيعات
      ),
      home: const MainDashboard(),
    );
  }
}

class MainDashboard extends StatefulWidget {
  const MainDashboard({Key? key}) : super(key: key);

  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  int _currentIndex = 0;
  final List<Widget> _tabs = [
    const DashboardOverview(),
    const InventoryManagerView(),
    const RepairTrackerView(),
    const POSInvoiceView(),
    const LiveChatView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: _tabs[_currentIndex]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.tealAccent,
        unselectedItemColor: Colors.grey,
        backgroundColor: const Color(0xFF1E293B),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
          BottomNavigationBarItem(icon: Icon(Icons.phone_iphone), label: 'المخزون'),
          BottomNavigationBarItem(icon: Icon(Icons.build_circle), label: 'الصيانة'),
          BottomNavigationBarItem(icon: Icon(Icons.point_of_sale), label: 'المبيعات'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'المحادثة'),
        ],
      ),
    );
  }
}

// تمثيل مبسط لواجهة المخزون (InventoryManagerView)
class InventoryManagerView extends StatelessWidget {
  const InventoryManagerView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final firestoreService = FirestoreService();

    return Scaffold(
      appBar: AppBar(title: const Text('قائمة المنتجات والمخزون')),
      body: StreamBuilder<List<InventoryItem>>(
        stream: firestoreService.streamInventory(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final items = snapshot.data!;
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Card(
                margin: const EdgeInsets.all(8),
                child: ListTile(
                  title: Text(item.name),
                  subtitle: Text('الموديل: \${item.model} | السعر: \${item.price} ج.م'),
                  trailing: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: item.stock > 3 ? Colors.teal : Colors.red,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('المخزون: \${item.stock}'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

// دمج واجهة الصيانة (RepairTrackerView) ومبيعات المحل (POSInvoiceView) والدردشة تتم بنفس طريقة الـ StreamBuilder
class DashboardOverview extends StatelessWidget {
  const DashboardOverview({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('مرحبًا بك في لوحة تحكم الهاتف الذكي الفورية لجهاز الموظف!'),
      ),
    );
  }
}

class RepairTrackerView extends StatelessWidget {
  const RepairTrackerView({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('صيانة الهواتف')));
}

class POSInvoiceView extends StatelessWidget {
  const POSInvoiceView({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('نقطة البيع')));
}

class LiveChatView extends StatelessWidget {
  const LiveChatView({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('دردشة الموظفين')));
}
`;
