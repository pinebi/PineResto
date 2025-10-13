'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiMinus, FiTrash2, FiEdit2, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface Product {
    id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

interface OrderItem {
    id: string;
  productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function TablePOSPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [numberInput, setNumberInput] = useState<string>(''); // Sayı girişi
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [selectedItemsForPayment, setSelectedItemsForPayment] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({});
  const [lastClickTime, setLastClickTime] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 8; // 2x4 grid için
  const [showPOSModal, setShowPOSModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Zamanı güncelle
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // SQL'den kategorileri ve ürünleri yükle
    loadData();
    
    // Mevcut siparişleri yükle
    loadExistingOrders();
    
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Kategorileri yükle
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // İlk kategoriyi seç
        if (categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].id);
        }
      }
      
      // Ürünleri yükle
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mevcut siparişleri yükle
  const loadExistingOrders = async () => {
    try {
      const response = await fetch(`/api/orders?tableId=table-${tableId}&status=pending`);
      if (response.ok) {
        const orders = await response.json();
        if (orders.length > 0) {
          // En son siparişi al
          const latestOrder = orders[0];
          setExistingOrder(latestOrder);
          
          // Sipariş kalemlerini orderItems'a yükle
          if (latestOrder.items && latestOrder.items.length > 0) {
            const existingItems: OrderItem[] = latestOrder.items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              name: item.product_name,
              quantity: item.quantity,
              price: item.unit_price,
              total: item.total_price,
              notes: item.notes || undefined
            }));
            setOrderItems(existingItems);
          }
        }
      }
    } catch (error) {
      console.error('Mevcut siparişler yüklenirken hata:', error);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = p.categoryId === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      // Sabit sıralama - ürün adına göre alfabetik
      return a.name.localeCompare(b.name, 'tr');
    });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = currentPage * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.10; // %10 KDV
  const total = subtotal + tax;

  // Sayfalama fonksiyonları
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(0);
  };

  // Kategori değiştiğinde sayfa sıfırla
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    const now = Date.now();
    const lastClick = lastClickTime[product.id] || 0;
    
    // Çift tıklama kontrolü (500ms içinde)
    if (now - lastClick < 500) {
      // Çift tıklama - direkt sepete ekle
      handleQuickAdd(product);
      setLastClickTime({ ...lastClickTime, [product.id]: 0 }); // Reset
    } else {
      // Tek tıklama - modal aç
      setLastClickTime({ ...lastClickTime, [product.id]: now });
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
      setSelectedOptions({});
    setShowProductModal(true);
    }
  };

  const handleQuickAdd = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
        notes: undefined
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;
    
    const existingItem = orderItems.find(item => item.productId === selectedProduct.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item => 
        item.productId === selectedProduct.id 
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        quantity,
        price: selectedProduct.price,
        total: selectedProduct.price * quantity,
        notes: notes || undefined
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Sayısal tuşlar için fonksiyonlar
  const handleNumberInput = (number: string) => {
    setNumberInput(prev => prev + number);
  };

  const handleSpecialKey = (key: string) => {
    switch(key) {
      case 'ESC':
        setNumberInput('');
        setSelectedProduct(null); // Status bar'ı temizle
        break;
      case 'C':
        setNumberInput('');
        setSelectedProduct(null); // Status bar'ı temizle
        break;
      case 'X':
        setNumberInput(prev => prev.slice(0, -1)); // Son karakteri sil
        break;
      case 'PLU':
        // PLU işlemi
        break;
      case 'SATIR İPTALİ':
        // Seçili ürünü sil
        if (selectedOrderItemId) {
          handleRemoveItem(selectedOrderItemId);
          setSelectedOrderItemId(null);
          setNumberInput('');
        }
        break;
      case 'BELGE İPTALİ':
        // Belge iptal işlemi
        break;
      default:
        break;
    }
  };

  const handlePaymentMethod = (method: string) => {
    // Ödeme yöntemi seçildi
  };

  const handleOperation = (operation: string) => {
    if (operation === 'PARÇALI ÜRÜN ÖDEME') {
      setShowPartialPaymentModal(true);
      setSelectedItemsForPayment([]);
    }
  };

  // Parçalı ödeme için ürün seçimi
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemsForPayment(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Seçili ürünlerin toplam tutarı
  const getSelectedItemsTotal = () => {
    return orderItems
      .filter(item => selectedItemsForPayment.includes(item.id))
      .reduce((sum, item) => sum + item.total, 0);
  };

  // Parçalı ödeme işlemi
  const handlePartialPayment = (paymentMethod: string) => {
    const selectedItems = orderItems.filter(item => selectedItemsForPayment.includes(item.id));
    const total = getSelectedItemsTotal();
    
    alert(`${paymentMethod} ile ${total.toFixed(2)}₺ parçalı ödeme alındı.\n\nSeçili ürünler:\n${selectedItems.map(item => `${item.name} - ${item.total.toFixed(2)}₺`).join('\n')}`);
    
    // Seçili ürünleri siparişten çıkar
    setOrderItems(prev => prev.filter(item => !selectedItemsForPayment.includes(item.id)));
    setShowPartialPaymentModal(false);
    setSelectedItemsForPayment([]);
  };

  // ÇIKIŞ - Siparişi masaya kaydet
  const handleExit = async () => {
    if (orderItems.length === 0) {
      // Sipariş yoksa direkt geri dön
      router.push('/mobile/waiter');
      return;
    }

    try {
      // Mevcut sipariş varsa güncelle, yoksa yeni oluştur
      if (existingOrder) {
        // Mevcut siparişi güncelle - yeni ürünleri ekle
        const response = await fetch(`/api/orders/${existingOrder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: orderItems.map(item => ({
              product: {
                id: item.productId,
                name: item.name,
                price: item.price
              },
              quantity: item.quantity,
              notes: item.notes || null
            })),
            totalAmount: total,
            notes: `Masa ${tableId} - Garson Siparişi (Güncellendi)`
          }),
        });

        if (response.ok) {
          router.push('/mobile/waiter');
        } else {
          throw new Error('Sipariş güncellenemedi');
        }
      } else {
        // Yeni sipariş oluştur
        const orderData = {
          tableNumber: `table-${tableId}`,
          orderType: 'table',
          items: orderItems.map(item => ({
            product: {
              id: item.productId,
              name: item.name,
              price: item.price
            },
            quantity: item.quantity,
            notes: item.notes || null
          })),
          totalAmount: total,
          paymentMethod: null,
          notes: `Masa ${tableId} - Garson Siparişi`
        };

        console.log('Sipariş gönderiliyor:', orderData);

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (response.ok) {
          router.push('/mobile/waiter');
        } else {
          throw new Error(result.details || result.error || 'Sipariş kaydedilemedi');
        }
      }
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error);
      alert(`❌ Sipariş kaydedilirken bir hata oluştu!\n${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* 1 - Material Design Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur">
            MASA {tableId}
          </div>
        </div>
            <div className="text-center">
          <div className="text-xs opacity-80">ELEGANTKASA1</div>
            </div>
        <div className="text-right text-xs">
          <div>{mounted ? formatTime(currentTime) : '--:--:--'}</div>
          <div className="opacity-80">{mounted ? formatDate(currentTime) : ''}</div>
          </div>
        </div>

      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* 3 - Sol Panel - Sipariş Listesi */}
        <div className="w-1/3 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
          {/* Başlık */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 font-semibold text-sm flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span>SİPARİŞ LİSTESİ</span>
          </div>
          
          {/* Sipariş İçeriği */}
          <div className="flex-1 overflow-y-auto p-2">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-4xl mb-3">🛒</div>
                <div className="text-sm font-medium">Henüz ürün eklenmedi</div>
                <div className="text-xs mt-1">Sağdan ürün seçerek sipariş oluşturun</div>
        </div>
            ) : (
              <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div 
                key={item.id} 
                    onClick={() => setSelectedOrderItemId(item.id)}
                    className={`rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedOrderItemId === item.id 
                        ? 'bg-orange-50 shadow-md ring-2 ring-orange-500' 
                        : 'bg-gray-50 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {/* Ürün Başlığı */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-xs text-gray-800 flex-1 pr-2">{item.name}</div>
                        <div className="text-sm font-bold text-orange-600">₺{item.total.toFixed(2)}</div>
                      </div>
          </div>
                    
                    {/* Kontrol Paneli */}
                    <div className="p-2">
                      <div className="flex items-center justify-between">
                        {/* Sol: Miktar Kontrolü */}
                        <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                    <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(item.id, item.quantity - 1);
                            }}
                            className="bg-white hover:bg-red-50 text-red-600 w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-gray-200"
                          >
                            <FiMinus className="w-3 h-3" />
                    </button>
                          <span className="text-xs font-bold px-2 min-w-[30px] text-center bg-white rounded border border-gray-200">{item.quantity}</span>
                    <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(item.id, item.quantity + 1);
                            }}
                            className="bg-white hover:bg-green-50 text-green-600 w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-gray-200"
                          >
                            <FiPlus className="w-3 h-3" />
                        </button>
            </div>
                        
                        {/* Orta: Kompakt Fiyat Bilgileri */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">KDV:10%</span>
                          <span className="text-gray-500">Br:₺{item.price.toFixed(2)}</span>
                        </div>
                        
                        {/* Sağ: Silme Butonu */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded transition-colors border border-red-200"
                        >
                    <FiTrash2 className="w-3 h-3" />
                        </button>
                    </div>
                      
                      {/* Notlar */}
                    {item.notes && (
                        <div className="mt-2 p-1 bg-yellow-50 rounded border-l-2 border-yellow-400">
                          <div className="text-xs text-gray-700">💬 {item.notes}</div>
                      </div>
                    )}
                    </div>
                  </div>
            ))}
              </div>
            )}
          </div>
          
          {/* Toplam Bölümü - Material Design */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-3 flex-shrink-0">
            <div className="space-y-2">
              {/* Detaylar */}
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Ürün: {orderItems.length}</span>
                <span>Ara Toplam: ₺{subtotal.toFixed(2)}</span>
                <span>KDV: ₺{tax.toFixed(2)}</span>
              </div>
              
              {/* Ana Toplam - Material Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">💰 TOPLAM</span>
                  <span className="text-2xl font-bold">₺{total.toFixed(2)}</span>
                </div>
              </div>
                  </div>
                </div>
              </div>

        {/* 4 - Orta Panel - Kategoriler */}
        <div className="w-1/4 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 font-semibold text-sm flex items-center gap-2">
            <span className="text-xl">📁</span>
            <span>KATEGORİLER</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Yükleniyor...</div>
              </div>
            </div>
          ) : (
              <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 text-sm font-semibold rounded-2xl transition-all ${
                    selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                  {selectedCategory === category.id && (
                        <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</span>
                  )}
                    </div>
                </button>
              ))}
              </div>
            )}
          </div>
        </div>

        {/* 5 - Sağ Panel - Ürünler */}
        <div className="w-5/12 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
          {/* Arama Çubuğu - Material Design */}
          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Ürün ara..."
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
            />
          </div>

          <div ref={scrollContainerRef} className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
            {currentProducts.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl hover:shadow-xl hover:scale-105 transition-all p-3 flex flex-col h-32 group relative overflow-hidden shadow-md"
              >
                {/* En Çok Satan Badge - Material Chip */}
                {(product.id === '1' || product.id === '2' || product.id === '3') && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                    ⭐ ÇOK SATAN
                  </div>
                )}
                
                {/* Ürün Resmi veya Emoji */}
                <div className="flex items-start gap-2 mb-auto">
                  {product.imageUrl && product.imageUrl.startsWith('http') ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {product.imageUrl || '🍽️'}
                    </div>
                  )}
                  <div className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition-colors text-left line-clamp-2 flex-1">
                    {product.name}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t">
                  <div className="text-base font-bold text-orange-600">
                    ₺{product.price.toFixed(2)}
                  </div>
                  <div className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <FiPlus className="w-4 h-4" />
                  </div>
            </div>
              </button>
            ))}
            </div>
            </div>
          </div>

      {/* 6 - Material Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-xs shadow-inner">
        <div className="text-gray-600">
          {numberInput ? numberInput : (selectedProduct ? `✓ ${selectedProduct.name} - ₺${selectedProduct.price.toFixed(2)} sepete eklendi` : 'Ürün seçin...')}
        </div>
      </div>

      {/* Floating Action Buttons - Material Design */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-40">
        <button
          onClick={() => setShowPOSModal(true)}
          className="bg-blue-600 text-white px-6 py-4 rounded-full font-semibold text-base shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all flex items-center gap-2"
        >
          <span>📱</span>
          MENÜ DETAY
        </button>
        <button
          onClick={handleExit}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-full font-semibold text-base shadow-2xl hover:from-orange-600 hover:to-orange-700 hover:scale-110 transition-all flex items-center gap-2"
        >
          <span>✓</span>
          ÇIKIŞ
        </button>
      </div>

      {/* POS Panel Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">POS Panel - MENU DETAY</h3>
              <button
                onClick={() => setShowPOSModal(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                ✕ Kapat
              </button>
        </div>

            {/* Sayfalama Butonları */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
          <button 
                  onClick={() => { goToPrevPage(); handleOperation('ÖNCEKİ SAYFA'); }}
                  disabled={currentPage === 0}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <FiChevronUp className="w-4 h-4 inline mr-1" />
                  ÖNCEKİ
          </button>
          
          <button 
                  onClick={() => { goToFirstPage(); handleOperation('BAŞA DÖN'); }}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
          >
            BAŞA DÖN
          </button>
          
          <button 
                  onClick={() => { goToNextPage(); handleOperation('SONRAKİ SAYFA'); }}
                  disabled={currentPage >= totalPages - 1}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  SONRAKİ
                  <FiChevronDown className="w-4 h-4 inline ml-1" />
          </button>
        </div>

              <div className="text-sm text-gray-600 font-bold">
                Sayfa {currentPage + 1} / {totalPages}
              </div>
            </div>

            {/* POS Butonları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sol taraf - Nümerik tuşlar */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleSpecialKey('ESC')} className="bg-purple-800 text-white px-3 py-3 rounded text-sm font-bold hover:bg-purple-900">ESC</button>
                <button onClick={() => handleNumberInput('7')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">7</button>
                <button onClick={() => handleNumberInput('8')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">8</button>
                <button onClick={() => handleNumberInput('9')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">9</button>
                <button onClick={() => handleSpecialKey('SATIR İPTALİ')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">SATIR İPTALİ</button>
                <button onClick={() => handleNumberInput('4')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">4</button>
                <button onClick={() => handleNumberInput('5')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">5</button>
                <button onClick={() => handleNumberInput('6')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">6</button>
                <button onClick={() => handleSpecialKey('BELGE İPTALİ')} className="bg-red-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-red-700">BELGE İPTALİ</button>
                <button onClick={() => handleNumberInput('1')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">1</button>
                <button onClick={() => handleNumberInput('2')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">2</button>
                <button onClick={() => handleNumberInput('3')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">3</button>
                <button onClick={() => handleSpecialKey('PLU')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">PLU</button>
                <button onClick={() => handleSpecialKey('C')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">C</button>
                <button onClick={() => handleNumberInput('0')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">0</button>
                <button onClick={() => handleSpecialKey('X')} className="bg-gray-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-gray-700">X</button>
          </div>
          
          {/* Orta taraf - Ödeme butonları */}
              <div className="flex flex-col gap-2">
                <button onClick={() => handlePaymentMethod('NAKİT')} className="bg-orange-500 text-white px-4 py-3 rounded text-sm font-bold hover:bg-orange-600">NAKİT</button>
                <button onClick={() => handlePaymentMethod('KREDİ KARTI')} className="bg-orange-500 text-white px-4 py-3 rounded text-sm font-bold hover:bg-orange-600">KREDİ KARTI</button>
                <button onClick={() => handlePaymentMethod('AÇIK HESAP')} className="bg-orange-500 text-white px-4 py-3 rounded text-sm font-bold hover:bg-orange-600">AÇIK HESAP</button>
                <button onClick={() => handlePaymentMethod('KK OFLINE')} className="bg-orange-500 text-white px-4 py-3 rounded text-sm font-bold hover:bg-orange-600">KK OFLINE</button>
                <button onClick={() => handleOperation('ARA TOPLAM hesaplandı')} className="bg-red-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-red-700">ARA TOPLAM</button>
          </div>
          
          {/* Sağ Taraf - İşlem ve Kontrol Butonları */}
              <div className="flex flex-col gap-2">
                <button onClick={() => handleOperation('BELGE SEÇİMİ')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">BELGE SEÇİMİ</button>
                <button onClick={() => handleOperation('PARÇALI ÜRÜN ÖDEME')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">PARÇALI ÜRÜN ÖDEME</button>
                <button onClick={() => handleOperation('TEXT')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">TEXT</button>
                <button onClick={() => handleOperation('MASA AKTAR')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">MASA AKTAR</button>
                <button onClick={() => handleOperation('MUTFAĞA GÖNDER')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">MUTFAĞA GÖNDER</button>
                <button onClick={() => handleOperation('ADİSYON YAZDIR')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">ADİSYON YAZDIR</button>
                <button onClick={() => handleOperation('KİLİT KALDIR')} className="bg-green-600 text-white px-4 py-3 rounded text-sm font-bold hover:bg-green-700">KİLİT KALDIR</button>
          </div>
      </div>
    </div>
        </div>
      )}

      {/* Ürün Detay Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-bold mb-4">{selectedProduct.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Miktar:</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 p-2 rounded"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border rounded">{quantity}</span>
            <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 p-2 rounded"
            >
                  <FiPlus className="w-4 h-4" />
            </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Notlar:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded"
                rows={2}
                placeholder="Özel istekler..."
              />
            </div>
            
            <div className="text-lg font-bold mb-4">
              Toplam: ₺{(selectedProduct.price * quantity).toFixed(2)}
        </div>

            <div className="flex space-x-2">
            <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
            >
                İptal
            </button>
            <button
                onClick={handleAddToOrder}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
            >
                Sepete Ekle
            </button>
            </div>
          </div>
          </div>
        )}

      {/* Parçalı Ödeme Modal */}
      {showPartialPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Parçalı Ödeme</h3>
            
            {/* Ürün Listesi */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Sipariş Kalemleri:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orderItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-2 border rounded cursor-pointer ${
                      selectedItemsForPayment.includes(item.id) 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 ml-2">({item.quantity}x)</span>
                      </div>
                      <div className="font-bold">₺{item.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
            </div>
            </div>

            {/* Seçili Ürünler Toplamı */}
            {selectedItemsForPayment.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Seçili Ürünler Toplamı:</span>
                  <span className="font-bold text-green-600">₺{getSelectedItemsTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

            {/* Ödeme Yöntemleri */}
            {selectedItemsForPayment.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Ödeme Yöntemi:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handlePartialPayment('NAKİT')}
                    className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
                  >
                    NAKİT
                  </button>
            <button
                    onClick={() => handlePartialPayment('KREDİ KARTI')}
                    className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
                    KREDİ KARTI
            </button>
            <button
                    onClick={() => handlePartialPayment('AÇIK HESAP')}
                    className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
                    AÇIK HESAP
            </button>
            <button
                    onClick={() => handlePartialPayment('KK OFLINE')}
                    className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
                    KK OFLINE
            </button>
          </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPartialPaymentModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
              {selectedItemsForPayment.length === 0 && (
                <button
                  onClick={() => setShowPartialPaymentModal(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled
                >
                  Ürün Seçin
                </button>
        )}
      </div>
          </div>
        </div>
      )}
    </div>
  );
}