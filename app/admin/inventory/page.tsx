'use client';

import { useState, useEffect } from 'react';
import { FiPackage, FiAlertTriangle, FiTrendingDown, FiDollarSign, FiUsers, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface InventoryItem {
  id: string;
  name: string;
  category: 'ingredient' | 'beverage' | 'packaging' | 'other';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  lastRestockDate: string;
  expiryDate?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Recipe {
  id: string;
  productName: string;
  ingredients: { itemId: string; itemName: string; quantity: number; unit: string }[];
  cost: number;
  sellingPrice: number;
  profitMargin: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeView, setActiveView] = useState<'stock' | 'recipes' | 'suppliers'>('stock');

  useEffect(() => {
    // Demo envanter verileri
    const demoInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Kuzu Eti',
        category: 'ingredient',
        currentStock: 15,
        minStock: 20,
        maxStock: 100,
        unit: 'kg',
        unitPrice: 450,
        totalValue: 6750,
        supplier: 'Et Tedarik A.Ş.',
        lastRestockDate: '2024-01-08',
        expiryDate: '2024-01-15',
        status: 'low-stock'
      },
      {
        id: '2',
        name: 'Domates',
        category: 'ingredient',
        currentStock: 50,
        minStock: 30,
        maxStock: 100,
        unit: 'kg',
        unitPrice: 25,
        totalValue: 1250,
        supplier: 'Yaş Sebze Ltd.',
        lastRestockDate: '2024-01-09',
        expiryDate: '2024-01-12',
        status: 'in-stock'
      },
      {
        id: '3',
        name: 'Ayran',
        category: 'beverage',
        currentStock: 5,
        minStock: 20,
        maxStock: 100,
        unit: 'adet',
        unitPrice: 8,
        totalValue: 40,
        supplier: 'Süt Ürünleri A.Ş.',
        lastRestockDate: '2024-01-07',
        expiryDate: '2024-01-14',
        status: 'out-of-stock'
      },
      {
        id: '4',
        name: 'Ekmek',
        category: 'ingredient',
        currentStock: 45,
        minStock: 30,
        maxStock: 80,
        unit: 'adet',
        unitPrice: 5,
        totalValue: 225,
        supplier: 'Fırın Usta',
        lastRestockDate: '2024-01-09',
        status: 'in-stock'
      },
      {
        id: '5',
        name: 'Karton Kutu',
        category: 'packaging',
        currentStock: 8,
        minStock: 50,
        maxStock: 200,
        unit: 'adet',
        unitPrice: 2,
        totalValue: 16,
        supplier: 'Ambalaj Ltd.',
        lastRestockDate: '2024-01-05',
        status: 'out-of-stock'
      }
    ];

    const demoRecipes: Recipe[] = [
      {
        id: '1',
        productName: 'Adana Kebap',
        ingredients: [
          { itemId: '1', itemName: 'Kuzu Eti', quantity: 0.25, unit: 'kg' },
          { itemId: '2', itemName: 'Domates', quantity: 0.1, unit: 'kg' },
          { itemId: '4', itemName: 'Ekmek', quantity: 2, unit: 'adet' }
        ],
        cost: 125,
        sellingPrice: 180,
        profitMargin: 44
      },
      {
        id: '2',
        productName: 'İskender',
        ingredients: [
          { itemId: '1', itemName: 'Kuzu Eti', quantity: 0.2, unit: 'kg' },
          { itemId: '2', itemName: 'Domates', quantity: 0.15, unit: 'kg' },
          { itemId: '4', itemName: 'Ekmek', quantity: 3, unit: 'adet' }
        ],
        cost: 105,
        sellingPrice: 160,
        profitMargin: 52
      }
    ];

    setInventory(demoInventory);
    setRecipes(demoRecipes);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-stock': return 'Stokta';
      case 'low-stock': return 'Az Stok';
      case 'out-of-stock': return 'Tükendi';
      default: return status;
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventory.filter(i => i.status === 'low-stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'out-of-stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Envanter Yönetimi</h2>
          <p className="text-gray-600 mt-1">Stok takibi, reçete ve tedarikçi yönetimi</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <FiPlus className="w-4 h-4" />
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Değer</div>
              <div className="text-3xl font-bold mt-1">₺{totalValue.toLocaleString()}</div>
            </div>
            <FiDollarSign className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Ürün</div>
              <div className="text-3xl font-bold mt-1">{inventory.length}</div>
            </div>
            <FiPackage className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Az Stok</div>
              <div className="text-3xl font-bold mt-1">{lowStockCount}</div>
            </div>
            <FiAlertTriangle className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Tükenen</div>
              <div className="text-3xl font-bold mt-1">{outOfStockCount}</div>
            </div>
            <FiTrendingDown className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveView('stock')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeView === 'stock' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📦 Stok Takibi
          </button>
          <button
            onClick={() => setActiveView('recipes')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeView === 'recipes' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📝 Reçeteler
          </button>
          <button
            onClick={() => setActiveView('suppliers')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeView === 'suppliers' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🚚 Tedarikçiler
          </button>
        </div>

        {/* Stock View */}
        {activeView === 'stock' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mevcut Stok</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Değer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tedarikçi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.expiryDate && (
                          <div className="text-xs text-gray-500">SKT: {item.expiryDate}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">{item.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {item.currentStock} {item.unit}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.minStock} / {item.maxStock}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">₺{item.unitPrice}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ₺{item.totalValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.supplier}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recipes View */}
        {activeView === 'recipes' && (
          <div className="p-6">
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{recipe.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{recipe.ingredients.length} malzeme</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Kar Marjı</div>
                      <div className="text-2xl font-bold text-green-600">%{recipe.profitMargin}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Malzemeler:</div>
                      <div className="space-y-2">
                        {recipe.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{ing.itemName}</span>
                            <span className="font-medium">{ing.quantity} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Maliyet:</span>
                          <span className="font-semibold text-red-600">₺{recipe.cost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Satış Fiyatı:</span>
                          <span className="font-semibold text-green-600">₺{recipe.sellingPrice}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm font-medium text-gray-900">Net Kar:</span>
                          <span className="font-bold text-blue-600">₺{recipe.sellingPrice - recipe.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                      Reçeteyi Düzenle
                    </button>
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suppliers View */}
        {activeView === 'suppliers' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Et Tedarik A.Ş.', 'Yaş Sebze Ltd.', 'Süt Ürünleri A.Ş.', 'Fırın Usta', 'Ambalaj Ltd.'].map((supplier, idx) => (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FiUsers className="w-6 h-6 text-blue-600" />
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{supplier}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Ürün Sayısı: {Math.floor(Math.random() * 10) + 1}</div>
                    <div>Toplam: ₺{(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}</div>
                    <div>Son Sipariş: {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                    Sipariş Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
