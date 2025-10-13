'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Product, ProductOption } from '@/types';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function ProductsPanel() {
  const { products, setProducts, categories, setCategories, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  useEffect(() => {
    // Load products and categories from API
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, [setProducts, setCategories]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductOptions(product.options || []);
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
      categoryId: formData.get('categoryId') as string,
      imageUrl: formData.get('imageUrl') as string,
      order: parseInt(formData.get('order') as string),
      isActive: formData.get('isActive') === 'on',
      options: productOptions,
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
    setProductOptions([]);
  };

  const addOption = () => {
    const newOption: ProductOption = {
      id: Date.now().toString(),
      name: '',
      values: []
    };
    setProductOptions([...productOptions, newOption]);
  };

  const removeOption = (optionId: string) => {
    setProductOptions(productOptions.filter(opt => opt.id !== optionId));
  };

  const updateOption = (optionId: string, field: 'name' | 'values', value: string | string[]) => {
    setProductOptions(productOptions.map(opt => 
      opt.id === optionId ? { ...opt, [field]: value } : opt
    ));
  };

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === filterCategory);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Kategorisiz';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
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
          
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <FiPlus size={20} />
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{product.imageUrl}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{getCategoryName(product.categoryId)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  ₺{product.price.toFixed(2)}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺) *
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

              {/* Product Options */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Çeşni Ekle
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-primary-500 hover:text-primary-600 text-sm font-semibold flex items-center space-x-1"
                  >
                    <FiPlus size={16} />
                    <span>Seçenek Ekle</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {productOptions.map((option, index) => (
                    <div key={option.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="text"
                          placeholder="Seçenek adı (örn: Acılık Derecesi)"
                          value={option.name}
                          onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Değerler (virgülle ayırın: Az Acılı, Normal, Çok Acılı)"
                        value={option.values.join(', ')}
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                          updateOption(option.id, 'values', values);
                        }}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
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
                    setProductOptions([]);
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

