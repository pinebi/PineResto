'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Category } from '@/types';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function CategoriesPanel() {
  const { categories, setCategories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load categories from API
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, [setCategories]);

  const buildCategoryTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(cat.id),
      }));
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      deleteCategory(id);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: (formData.get('parentId') as string) || null,
      order: parseInt(formData.get('order') as string),
      imageUrl: formData.get('imageUrl') as string,
      isActive: formData.get('isActive') === 'on',
    };

    if (editingCategory) {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      updateCategory(editingCategory.id, categoryData);
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      addCategory(categoryData as Category);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div 
          className="flex items-center justify-between p-4 hover:bg-gray-50 border-b"
          style={{ paddingLeft: `${level * 2 + 1}rem` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            
            <span className="text-2xl">{category.imageUrl}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs ${
              category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Aktif' : 'Pasif'}
            </span>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && category.children!.map(child => 
          renderCategory(child, level + 1)
        )}
      </div>
    );
  };

  const categoryTree = buildCategoryTree();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus size={20} />
          <span>Yeni Kategori</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categoryTree.map(category => renderCategory(category))}
      </div>

      {/* Modal */}
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
                  name="name"
                  defaultValue={editingCategory?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  defaultValue={editingCategory?.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üst Kategori
                </label>
                <select
                  name="parentId"
                  defaultValue={editingCategory?.parentId || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Ana Kategori</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id && c.parentId === null)
                    .map(c => (
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
                  defaultValue={editingCategory?.imageUrl}
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
                  defaultValue={editingCategory?.order || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingCategory?.isActive ?? true}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
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
                    setEditingCategory(null);
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



