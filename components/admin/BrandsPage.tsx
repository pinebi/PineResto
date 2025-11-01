'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiSearch, FiFilter } from 'react-icons/fi';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true
  });

  // Demo marka verileri
  useEffect(() => {
    const demoBrands: Brand[] = [
      {
        id: '1',
        name: 'Coca-Cola',
        description: 'Dünyaca ünlü içecek markası',
        logo: '🥤',
        website: 'https://coca-cola.com',
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Nestlé',
        description: 'Gıda ve içecek şirketi',
        logo: '🍫',
        website: 'https://nestle.com',
        isActive: true,
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
      },
      {
        id: '3',
        name: 'Unilever',
        description: 'Kişisel bakım ve gıda ürünleri',
        logo: '🧴',
        website: 'https://unilever.com',
        isActive: false,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-17'
      }
    ];
    setBrands(demoBrands);
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (newBrand.name?.trim()) {
      const brand: Brand = {
        id: Date.now().toString(),
        name: newBrand.name,
        description: newBrand.description || '',
        logo: newBrand.logo || '',
        website: newBrand.website || '',
        isActive: newBrand.isActive || true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBrands([...brands, brand]);
      setNewBrand({ name: '', description: '', logo: '', website: '', isActive: true });
      setIsAdding(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setNewBrand(brand);
  };

  const handleSave = () => {
    if (newBrand.name?.trim()) {
      setBrands(brands.map(brand => 
        brand.id === editingId 
          ? { ...brand, ...newBrand, updatedAt: new Date().toISOString().split('T')[0] }
          : brand
      ));
      setEditingId(null);
      setNewBrand({ name: '', description: '', logo: '', website: '', isActive: true });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      setBrands(brands.filter(brand => brand.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewBrand({ name: '', description: '', logo: '', website: '', isActive: true });
  };

  const toggleStatus = (id: string) => {
    setBrands(brands.map(brand => 
      brand.id === id 
        ? { ...brand, isActive: !brand.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : brand
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Marka Yönetimi</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Yeni Marka Ekle
        </button>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Marka ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <FiFilter className="w-4 h-4" />
            Filtrele
          </button>
        </div>
      </div>

      {/* Yeni Marka Ekleme Formu */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Yeni Marka Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marka Adı *
              </label>
              <input
                type="text"
                value={newBrand.name || ''}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Marka adını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo (Emoji)
              </label>
              <input
                type="text"
                value={newBrand.logo || ''}
                onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🥤"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={newBrand.website || ''}
                onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={newBrand.isActive ? 'active' : 'inactive'}
                onChange={(e) => setNewBrand({ ...newBrand, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={newBrand.description || ''}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Marka açıklaması"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiSave className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiX className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Marka Listesi */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marka Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl">{brand.logo || '🏷️'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {editingId === brand.id ? (
                        <input
                          type="text"
                          value={newBrand.name || ''}
                          onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        brand.name
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {editingId === brand.id ? (
                        <textarea
                          value={newBrand.description || ''}
                          onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        brand.description || '-'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {editingId === brand.id ? (
                        <input
                          type="url"
                          value={newBrand.website || ''}
                          onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        brand.website ? (
                          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {brand.website}
                          </a>
                        ) : '-'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(brand.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        brand.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {brand.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {editingId === brand.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900"
                            title="Kaydet"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                            title="İptal"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(brand)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Marka bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Arama kriterlerinize uygun marka bulunamadı.' : 'Henüz hiç marka eklenmemiş.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                İlk Markayı Ekle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}










