'use client';

import { useState } from 'react';
import { FiDownload, FiPrinter, FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');

  // Demo veriler
  const salesData = {
    totalRevenue: 45680,
    totalOrders: 234,
    avgOrderValue: 195,
    topProducts: [
      { name: 'Adana Kebap', sales: 89, revenue: 8900 },
      { name: 'İskender', sales: 67, revenue: 6700 },
      { name: 'Pide', sales: 54, revenue: 4320 },
      { name: 'Lahmacun', sales: 45, revenue: 2250 },
      { name: 'Serpme Kahvaltı', sales: 34, revenue: 3400 },
    ],
    categoryStats: [
      { category: 'Ana Yemekler', orders: 156, revenue: 31200, percentage: 68 },
      { category: 'İçecekler', orders: 234, revenue: 4680, percentage: 10 },
      { category: 'Tatlılar', orders: 89, revenue: 4450, percentage: 10 },
      { category: 'Kahvaltı', orders: 45, revenue: 5350, percentage: 12 },
    ],
    hourlyData: [
      { hour: '09:00', orders: 12, revenue: 2400 },
      { hour: '10:00', orders: 18, revenue: 3600 },
      { hour: '11:00', orders: 25, revenue: 5000 },
      { hour: '12:00', orders: 45, revenue: 9000 },
      { hour: '13:00', orders: 52, revenue: 10400 },
      { hour: '14:00', orders: 38, revenue: 7600 },
      { hour: '15:00', orders: 15, revenue: 3000 },
      { hour: '16:00', orders: 8, revenue: 1600 },
      { hour: '17:00', orders: 10, revenue: 2000 },
      { hour: '18:00', orders: 32, revenue: 6400 },
      { hour: '19:00', orders: 48, revenue: 9600 },
      { hour: '20:00', orders: 41, revenue: 8200 },
    ],
  };

  const exportToExcel = () => {
    alert('Excel dosyası indiriliyor...');
  };

  const exportToPDF = () => {
    alert('PDF dosyası indiriliyor...');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raporlar ve Analizler</h2>
          <p className="text-gray-600 mt-1">Detaylı satış raporlarını görüntüleyin ve analiz edin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={printReport}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPrinter className="w-4 h-4" />
            Yazdır
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Bugün</option>
              <option value="yesterday">Dün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
              <option value="custom">Özel Aralık</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rapor Tipi</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Satış Raporu</option>
              <option value="products">Ürün Raporu</option>
              <option value="categories">Kategori Raporu</option>
              <option value="waiter">Garson Performansı</option>
              <option value="hourly">Saatlik Analiz</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Karşılaştırma</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="none">Karşılaştırma Yok</option>
              <option value="prev">Önceki Dönem</option>
              <option value="year">Geçen Yıl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Ciro</div>
              <div className="text-3xl font-bold mt-1">€{salesData.totalRevenue.toLocaleString()}</div>
              <div className="text-xs mt-2 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +15.3% önceki döneme göre
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FiDollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Toplam Sipariş</div>
              <div className="text-3xl font-bold mt-1">{salesData.totalOrders}</div>
              <div className="text-xs mt-2 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +8.7% önceki döneme göre
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FiShoppingBag className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Ortalama Sipariş</div>
              <div className="text-3xl font-bold mt-1">€{salesData.avgOrderValue}</div>
              <div className="text-xs mt-2 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +6.2% önceki döneme göre
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FiDollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Aktif Müşteri</div>
              <div className="text-3xl font-bold mt-1">1,247</div>
              <div className="text-xs mt-2 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-1" />
                +12.1% önceki döneme göre
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FiUsers className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Satan Ürünler</h3>
          <div className="space-y-4">
            {salesData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sales} adet</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">€{product.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{((product.revenue / salesData.totalRevenue) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Bazlı Satışlar</h3>
          <div className="space-y-4">
            {salesData.categoryStats.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">{category.category}</div>
                  <div className="text-sm text-gray-600">€{category.revenue.toLocaleString()}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-500">{category.orders} sipariş</div>
                  <div className="text-xs font-medium text-blue-600">{category.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Analysis */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saatlik Satış Analizi</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş Sayısı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ort. Sipariş</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grafik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData.hourlyData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.hour}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{data.orders}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">€{data.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">€{(data.revenue / data.orders).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(data.revenue / 10400) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
