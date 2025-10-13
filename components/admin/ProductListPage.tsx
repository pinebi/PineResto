'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Product } from '@/types';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiSearch, FiFilter, FiCopy } from 'react-icons/fi';
import ProductDetailPage from './ProductDetailPage';

export default function ProductListPage() {
  const { products, setProducts, categories, setCategories, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);

  useEffect(() => {
    // Load products and categories from API
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
    
    loadPrinters();
  }, [setProducts, setCategories]);

  const loadPrinters = async () => {
    try {
      // Load database printers
      const res = await fetch('/api/printers');
      const data = await res.json();
      setPrinters(data);
    } catch (err) {
      console.error('Yazıcı yükleme hatası:', err);
    }
  };

  const loadSystemPrinters = async () => {
    try {
      setIsLoadingPrinters(true);
      const res = await fetch('/api/printers/system');
      const data = await res.json();
      setSystemPrinters(data);
    } catch (err) {
      console.error('Sistem yazıcıları yükleme hatası:', err);
      alert('Sistem yazıcıları yüklenemedi!');
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  const addSystemPrinter = async (printer: any) => {
    try {
      await fetch('/api/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: printer.name,
          type: printer.type,
          location: 'Sistem Yazıcısı',
          ip_address: 'localhost',
          port: 9100
        })
      });
      
      await loadPrinters();
      alert(`${printer.name} sisteme eklendi!`);
    } catch (err) {
      console.error('Yazıcı ekleme hatası:', err);
      alert('Yazıcı eklenirken hata oluştu!');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      deleteProduct(id);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      purchasePrice: parseFloat(formData.get('purchasePrice') as string) || 0,
      categoryId: formData.get('categoryId') as string,
      brand: formData.get('brand') as string || 'Genel Markalar',
      stockCode: formData.get('stockCode') as string || Date.now().toString(),
      stock: parseInt(formData.get('stock') as string) || 0,
      imageUrl: formData.get('imageUrl') as string,
      order: parseInt(formData.get('order') as string),
      printerId: formData.get('printerId') as string || null,
      isActive: formData.get('isActive') === 'on',
      isNewProduct: formData.get('isNewProduct') === 'on',
      isFastShipping: formData.get('isFastShipping') === 'on',
      isShowcase: formData.get('isShowcase') === 'on',
      source: 'SYSTEM',
      updatedAt: new Date(),
    };

    if (editingProduct) {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      updateProduct(editingProduct.id, productData);
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      addProduct(productData as Product);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'created':
          comparison = new Date(a.id).getTime() - new Date(b.id).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Kategorisiz';
  };

  const handleToggleStatus = async (productId: string, field: 'isActive' | 'isNewProduct' | 'isFastShipping' | 'isShowcase') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedProduct = { ...product, [field]: !product[field], updatedAt: new Date() };
    await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });
    updateProduct(productId, { [field]: !product[field] });
  };

  const handleCopyProduct = (product: Product) => {
    const copiedProduct = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Kopya)`,
      stockCode: Date.now().toString(),
      updatedAt: new Date(),
    };
    addProduct(copiedProduct as Product);
  };

  return (
    <div className="space-y-6">
      {selectedProductId && (
        <ProductDetailPage 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Ürün Listesi</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus size={20} />
          <span>Yeni Ürün</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'created')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">İsme Göre</option>
            <option value="price">Fiyata Göre</option>
            <option value="created">Tarihe Göre</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <FiFilter size={16} />
            <span>{sortOrder === 'asc' ? 'Artan' : 'Azalan'}</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat Bilgisi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Durumu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{product.id.slice(-4)}
                  </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className="text-2xl" style={{display: product.imageUrl ? 'none' : 'flex'}}>📦</span>
                        </div>
                      </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        <div><strong>Kategori:</strong> {getCategoryName(product.categoryId)}</div>
                        <div><strong>Marka:</strong> {product.brand || 'Genel Markalar'}</div>
                        <div><strong>Stok Kodu:</strong> {product.stockCode || product.id}</div>
                        <div><strong>Stok:</strong> {product.stock || 0} Adet</div>
                        <div><strong>Güncelleme:</strong> {product.updatedAt ? new Date(product.updatedAt).toLocaleString('tr-TR') : 'Bilinmiyor'}</div>
                      </div>
                      {product.source && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.source}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">P.Satış</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={product.purchasePrice || 0}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Satış</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={product.price}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Aktif</span>
                        <button
                          onClick={() => handleToggleStatus(product.id, 'isActive')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.isActive ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Yeni Ürün</span>
                        <button
                          onClick={() => handleToggleStatus(product.id, 'isNewProduct')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.isNewProduct ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.isNewProduct ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Hızlı Kargo</span>
                        <button
                          onClick={() => handleToggleStatus(product.id, 'isFastShipping')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.isFastShipping ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.isFastShipping ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Vitrin Ürünü</span>
                        <button
                          onClick={() => handleToggleStatus(product.id, 'isShowcase')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.isShowcase ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.isShowcase ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => setSelectedProductId(product.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <FiEye size={12} />
                            <span>Detay Gör</span>
                          </button>
                      <button
                        onClick={() => handleCopyProduct(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                      >
                        <FiCopy size={12} />
                        <span>Ürünü Kopyala</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                      >
                        <FiTrash2 size={12} />
                        <span>Ürünü Sil</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun ürün bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama *
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alış Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchasePrice"
                    defaultValue={editingProduct?.purchasePrice || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satış Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    defaultValue={editingProduct?.price}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka
                </label>
                <input
                  type="text"
                  name="brand"
                  defaultValue={editingProduct?.brand || 'Genel Markalar'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Kodu
                </label>
                <input
                  type="text"
                  name="stockCode"
                  defaultValue={editingProduct?.stockCode || Date.now().toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Miktarı
                </label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={editingProduct?.stock || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  name="categoryId"
                  defaultValue={editingProduct?.categoryId}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yazıcı
                </label>
                <div className="space-y-2">
                  <select
                    name="printerId"
                    defaultValue={(editingProduct as any)?.printerId || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Yazıcı Seçin (Boş = Kategori Yazıcısı)</option>
                    {printers.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.type}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => {
                      loadSystemPrinters();
                    }}
                    disabled={isLoadingPrinters}
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:bg-gray-300"
                  >
                    {isLoadingPrinters ? 'Yükleniyor...' : '🖨️ Bilgisayardan Yazıcı Ekle'}
                  </button>
                  
                  {systemPrinters.length > 0 && (
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Bilgisayarınızdaki Yazıcılar:</p>
                      {systemPrinters.map((sp, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 text-xs">
                          <span className="text-gray-700">{sp.name} ({sp.type})</span>
                          <button
                            type="button"
                            onClick={() => {
                              addSystemPrinter(sp);
                              setSystemPrinters([]);
                            }}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                          >
                            Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Yazıcı seçilmezse, kategorinin yazıcısı kullanılır
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon (Emoji)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra
                </label>
                <input
                  type="number"
                  name="order"
                  defaultValue={editingProduct?.order || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    defaultChecked={editingProduct?.isActive ?? true}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Aktif
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNewProduct"
                    id="isNewProduct"
                    defaultChecked={editingProduct?.isNewProduct ?? false}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isNewProduct" className="ml-2 text-sm font-medium text-gray-700">
                    Yeni Ürün
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFastShipping"
                    id="isFastShipping"
                    defaultChecked={editingProduct?.isFastShipping ?? false}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isFastShipping" className="ml-2 text-sm font-medium text-gray-700">
                    Hızlı Kargo
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isShowcase"
                    id="isShowcase"
                    defaultChecked={editingProduct?.isShowcase ?? false}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isShowcase" className="ml-2 text-sm font-medium text-gray-700">
                    Vitrin Ürünü
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
