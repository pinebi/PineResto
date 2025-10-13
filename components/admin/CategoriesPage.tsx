'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Category } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

export default function CategoriesPage() {
  const { categories, setCategories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    imageUrl: '',
    order: 0,
    printerId: '',
    isActive: true
  });

  useEffect(() => {
    // Load categories from API
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
    
    loadPrinters();
  }, [setCategories]);

  const loadPrinters = async () => {
    try {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      id: editingCategory?.id || Date.now().toString(),
      name: newCategory.name,
      imageUrl: newCategory.imageUrl,
      order: newCategory.order,
      printerId: newCategory.printerId || null,
      isActive: newCategory.isActive,
    };

    try {
      if (editingCategory) {
        // Update existing category
        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? categoryData as Category : c));
      } else {
        // Create new category
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        setCategories([...categories, categoryData as Category]);
      }

      // Reset form
      setNewCategory({ name: '', imageUrl: '', order: 0, printerId: '', isActive: true });
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Kategori kaydetme hatası:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      imageUrl: category.imageUrl || '',
      order: category.order,
      printerId: (category as any).printerId || '',
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error('Kategori silme hatası:', error);
      }
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: '', imageUrl: '', order: 0, printerId: '', isActive: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kategoriler</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus size={20} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-3">{category.imageUrl || '📁'}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kategori yok</h3>
          <p className="text-gray-500 mb-4">İlk kategorinizi oluşturmak için yukarıdaki butona tıklayın.</p>
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon (Emoji)
                </label>
                <input
                  type="text"
                  value={newCategory.imageUrl}
                  onChange={(e) => setNewCategory({...newCategory, imageUrl: e.target.value})}
                  placeholder="📁"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra
                </label>
                <input
                  type="number"
                  value={newCategory.order}
                  onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yazıcı
                </label>
                <div className="space-y-2">
                  <select
                    value={newCategory.printerId}
                    onChange={(e) => setNewCategory({...newCategory, printerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Yazıcı Seçin (Boş = Yazıcısız)</option>
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
                    Bu kategorideki ürünler için varsayılan yazıcı
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <FiSave size={16} />
                  <span>Kaydet</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <FiX size={16} />
                  <span>İptal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


