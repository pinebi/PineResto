'use client';

import { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiEdit2 } from 'react-icons/fi';

interface OptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  orderIndex: number;
}

interface OptionGroup {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  values: OptionValue[];
}

interface OptionGroupEditPageProps {
  groupId: string;
  onClose: () => void;
}

export default function OptionGroupEditPage({ groupId, onClose }: OptionGroupEditPageProps) {
  const [group, setGroup] = useState<OptionGroup | null>(null);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valueForm, setValueForm] = useState({
    name: '',
    priceModifier: 0,
    isDefault: false,
  });

  // Disable body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Load group data (demo)
  useEffect(() => {
    // Gerçek uygulamada API'den çekilecek
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
    ];

    const foundGroup = demoGroups.find(g => g.id === groupId);
    setGroup(foundGroup || null);
  }, [groupId]);

  const handleAddValue = () => {
    setIsEditingValue(true);
    setEditingValueId(null);
    setValueForm({ name: '', priceModifier: 0, isDefault: false });
  };

  const handleEditValue = (value: OptionValue) => {
    setIsEditingValue(true);
    setEditingValueId(value.id);
    setValueForm({
      name: value.name,
      priceModifier: value.priceModifier,
      isDefault: value.isDefault,
    });
  };

  const handleSaveValue = () => {
    if (!group) return;

    if (editingValueId) {
      // Update existing value
      const updatedValues = group.values.map(v =>
        v.id === editingValueId
          ? { ...v, ...valueForm }
          : v
      );
      setGroup({ ...group, values: updatedValues });
    } else {
      // Add new value
      const newValue: OptionValue = {
        id: Date.now().toString(),
        ...valueForm,
        orderIndex: group.values.length + 1,
      };
      setGroup({ ...group, values: [...group.values, newValue] });
    }

    setIsEditingValue(false);
    setEditingValueId(null);
    setValueForm({ name: '', priceModifier: 0, isDefault: false });
  };

  const handleDeleteValue = (valueId: string) => {
    if (!group) return;
    if (confirm('Bu seçeneği silmek istediğinizden emin misiniz?')) {
      const updatedValues = group.values.filter(v => v.id !== valueId);
      setGroup({ ...group, values: updatedValues });
    }
  };

  const handleSaveGroup = () => {
    // Gerçek uygulamada API'ye gönderilecek
    console.log('Grup kaydedildi:', group);
    alert('Seçenek grubu başarıyla kaydedildi!');
    onClose();
  };

  if (!group) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-gray-600">Grup bulunamadı</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">{group.name} - Seçenek Değerleri</h2>
          </div>
          <button
            onClick={handleSaveGroup}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiSave size={16} />
            <span>Kaydet</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Group Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{group.description}</p>
            {group.isRequired && (
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                Zorunlu Seçenek
              </span>
            )}
          </div>

          {/* Add Value Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Seçenek Değerleri</h3>
            <button
              onClick={handleAddValue}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiPlus size={16} />
              <span>Yeni Değer Ekle</span>
            </button>
          </div>

          {/* Values List */}
          <div className="space-y-3">
            {group.values.map((value) => (
              <div
                key={value.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-gray-500 font-mono text-sm">#{value.orderIndex}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{value.name}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      {value.isDefault && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Varsayılan
                        </span>
                      )}
                      {value.priceModifier !== 0 && (
                        <span className={`text-sm font-medium ${
                          value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {value.priceModifier > 0 ? '+' : ''}₺{value.priceModifier.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditValue(value)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteValue(value.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {group.values.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz seçenek değeri yok</h3>
              <p className="text-gray-500 mb-4">İlk seçenek değerinizi eklemek için yukarıdaki butona tıklayın.</p>
            </div>
          )}

          {/* Value Edit Form Modal */}
          {isEditingValue && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingValueId ? 'Değeri Düzenle' : 'Yeni Değer Ekle'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Değer Adı *
                    </label>
                    <input
                      type="text"
                      value={valueForm.name}
                      onChange={(e) => setValueForm({...valueForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Örn: Çok Acılı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiyat Değişikliği (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueForm.priceModifier}
                      onChange={(e) => setValueForm({...valueForm, priceModifier: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pozitif değer fiyata ekler, negatif değer fiyattan çıkarır
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={valueForm.isDefault}
                      onChange={(e) => setValueForm({...valueForm, isDefault: e.target.checked})}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-700">
                      Varsayılan seçenek
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={handleSaveValue}
                      disabled={!valueForm.name.trim()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingValue(false);
                        setEditingValueId(null);
                        setValueForm({ name: '', priceModifier: 0, isDefault: false });
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
