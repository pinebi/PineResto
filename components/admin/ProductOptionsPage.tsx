'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiSettings } from 'react-icons/fi';
import OptionGroupEditPage from './OptionGroupEditPage';

interface OptionGroup {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  orderIndex: number;
}

export default function ProductOptionsPage() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isRequired: false,
  });

  // Demo data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    const demoGroups: OptionGroup[] = [
      {
        id: 'spice_level',
        name: 'Acılık Derecesi',
        description: 'Ürünün acılık seviyesini belirler',
        isRequired: true,
        values: [
          { id: 'spice_mild', name: 'Az Acılı', priceModifier: 0, isDefault: true, orderIndex: 1 },
          { id: 'spice_medium', name: 'Normal', priceModifier: 0, isDefault: false, orderIndex: 2 },
          { id: 'spice_hot', name: 'Çok Acılı', priceModifier: 2, isDefault: false, orderIndex: 3 },
        ]
      },
      {
        id: 'size',
        name: 'Porsiyon Boyutu',
        description: 'Ürünün porsiyon boyutunu belirler',
        isRequired: false,
        values: [
          { id: 'size_small', name: 'Küçük', priceModifier: -10, isDefault: false, orderIndex: 1 },
          { id: 'size_medium', name: 'Orta', priceModifier: 0, isDefault: true, orderIndex: 2 },
          { id: 'size_large', name: 'Büyük', priceModifier: 15, isDefault: false, orderIndex: 3 },
        ]
      },
      {
        id: 'bread_type',
        name: 'Ekmek Türü',
        description: 'Ekmeğin türünü belirler',
        isRequired: false,
        values: [
          { id: 'bread_white', name: 'Beyaz Ekmek', priceModifier: 0, isDefault: true, orderIndex: 1 },
          { id: 'bread_wheat', name: 'Tam Buğday', priceModifier: 1, isDefault: false, orderIndex: 2 },
          { id: 'bread_corn', name: 'Mısır Ekmeği', priceModifier: 1.5, isDefault: false, orderIndex: 3 },
        ]
      }
    ];
    setOptionGroups(demoGroups);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGroup) {
      // Update existing group
      setOptionGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...formData }
          : group
      ));
    } else {
      // Add new group
      const newGroup: OptionGroup = {
        id: Date.now().toString(),
        ...formData,
        values: []
      };
      setOptionGroups(prev => [...prev, newGroup]);
    }
    
    setIsModalOpen(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '', isRequired: false });
  };

  const handleEdit = (group: OptionGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      isRequired: group.isRequired,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu çeşni grubunu silmek istediğinizden emin misiniz?')) {
      setOptionGroups(prev => prev.filter(group => group.id !== id));
    }
  };

  const openModal = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '', isRequired: false });
    setIsModalOpen(true);
  };

  return (
    <>
      {editingGroupId && (
        <OptionGroupEditPage
          groupId={editingGroupId}
          onClose={() => setEditingGroupId(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Çeşniler</h2>
            <p className="text-sm text-gray-600 mt-1">Ürünleriniz için çeşni grupları ve değerleri tanımlayın</p>
          </div>
          <button
            onClick={openModal}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus size={20} />
            <span>Yeni Çeşni Grubu</span>
          </button>
        </div>

        {/* Option Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {optionGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {group.isRequired && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                          Zorunlu
                        </span>
                      )}
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {group.values.length} Çeşni
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingGroupId(group.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Çeşnileri Düzenle"
                    >
                      <FiSettings size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(group)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Grup Bilgilerini Düzenle"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Grubu Sil"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700">Çeşni Değerleri:</h4>
                  {group.values.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {group.values.map((value) => (
                        <div key={value.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                          <span className="text-gray-900 font-medium">{value.name}</span>
                          <div className="flex items-center space-x-2">
                            {value.isDefault && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Varsayılan
                              </span>
                            )}
                            {value.priceModifier !== 0 && (
                              <span className={`text-xs font-medium ${
                                value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {value.priceModifier > 0 ? '+' : ''}€{value.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Henüz çeşni değeri eklenmemiş</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => setEditingGroupId(group.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                  >
                    <FiSettings size={16} />
                    <span>Çeşnileri Yönet</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {optionGroups.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz çeşni grubu yok</h3>
            <p className="text-gray-500 mb-6">
              Ürünlerinize farklı çeşniler eklemek için çeşni grupları oluşturun.<br />
              Örnek: Acılık derecesi, porsiyon boyutu, ekstra malzemeler vb.
            </p>
            <button
              onClick={openModal}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <FiPlus size={20} />
              <span>İlk Çeşni Grubunu Oluştur</span>
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingGroup ? 'Çeşni Grubunu Düzenle' : 'Yeni Çeşni Grubu'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grup Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Acılık Derecesi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Bu çeşni grubunun açıklaması"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isRequired" className="ml-2 text-sm font-medium text-gray-700">
                  Zorunlu çeşni
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiSave className="inline mr-2" />
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <FiX className="inline mr-2" />
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
