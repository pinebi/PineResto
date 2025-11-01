'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Product, Category } from '@/types';
import { FiUpload, FiDownload, FiFileText, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function BulkOperationsPage() {
  const { products, categories, setProducts, addProduct } = useStore();
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSampleExcel = () => {
    const sampleData = [
      {
        'Ürün Adı': 'Örnek Ürün 1',
        'Açıklama': 'Bu bir örnek ürün açıklamasıdır',
        'Alış Fiyatı': 50.00,
        'Satış Fiyatı': 75.00,
        'Kategori': 'Ana Yemekler',
        'Marka': 'Genel Markalar',
        'Stok Kodu': 'SAMPLE001',
        'Stok Miktarı': 100,
        'İkon': '🍽️',
        'Aktif': true,
        'Yeni Ürün': false,
        'Hızlı Kargo': true,
        'Vitrin Ürünü': true,
        'Sıra': 1
      },
      {
        'Ürün Adı': 'Örnek Ürün 2',
        'Açıklama': 'İkinci örnek ürün açıklaması',
        'Alış Fiyatı': 25.00,
        'Satış Fiyatı': 35.00,
        'Kategori': 'İçecekler',
        'Marka': 'Premium Marka',
        'Stok Kodu': 'SAMPLE002',
        'Stok Miktarı': 50,
        'İkon': '🥤',
        'Aktif': true,
        'Yeni Ürün': true,
        'Hızlı Kargo': false,
        'Vitrin Ürünü': true,
        'Sıra': 2
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');

    // Excel dosyasını indir
    XLSX.writeFile(wb, 'urun_ornek_tablosu.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        processExcelData(jsonData);
      } catch (error) {
        console.error('Excel okuma hatası:', error);
        setImportResults({
          success: 0,
          errors: ['Excel dosyası okunamadı. Lütfen doğru formatı kullanın.'],
          total: 0
        });
        setIsImporting(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const processExcelData = (data: any[]) => {
    const errors: string[] = [];
    let successCount = 0;

    data.forEach((row, index) => {
      try {
        // Gerekli alanları kontrol et
        if (!row['Ürün Adı'] || !row['Satış Fiyatı']) {
          errors.push(`Satır ${index + 2}: Ürün adı ve satış fiyatı zorunludur`);
          return;
        }

        // Kategori kontrolü
        const categoryName = row['Kategori'] || 'Genel';
        let categoryId = categories.find(c => c.name === categoryName)?.id;
        
        if (!categoryId) {
          errors.push(`Satır ${index + 2}: "${categoryName}" kategorisi bulunamadı. Lütfen önce kategoriyi oluşturun.`);
          return;
        }

        // Ürün verilerini hazırla
        const productData: Product = {
          id: Date.now().toString() + index,
          name: row['Ürün Adı'],
          description: row['Açıklama'] || '',
          price: parseFloat(row['Satış Fiyatı']) || 0,
          purchasePrice: parseFloat(row['Alış Fiyatı']) || 0,
          categoryId: categoryId,
          brand: row['Marka'] || 'Genel Markalar',
          stockCode: row['Stok Kodu'] || Date.now().toString() + index,
          stock: parseInt(row['Stok Miktarı']) || 0,
          imageUrl: row['İkon'] || '📦',
          isActive: Boolean(row['Aktif']),
          isNewProduct: Boolean(row['Yeni Ürün']),
          isFastShipping: Boolean(row['Hızlı Kargo']),
          isShowcase: Boolean(row['Vitrin Ürünü']),
          order: parseInt(row['Sıra']) || 0,
          options: [],
          source: 'EXCEL_IMPORT',
          updatedAt: new Date(),
        };

        // Ürünü ekle
        addProduct(productData);
        successCount++;

      } catch (error) {
        errors.push(`Satır ${index + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    });

    setImportResults({
      success: successCount,
      errors,
      total: data.length
    });
    setIsImporting(false);

    // Dosya inputunu temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToExcel = () => {
    const exportData = products.map(product => {
      const category = categories.find(c => c.id === product.categoryId);
      return {
        'Ürün Adı': product.name,
        'Açıklama': product.description,
        'Alış Fiyatı': product.purchasePrice || 0,
        'Satış Fiyatı': product.price,
        'Kategori': category?.name || 'Kategorisiz',
        'Marka': product.brand || 'Genel Markalar',
        'Stok Kodu': product.stockCode || product.id,
        'Stok Miktarı': product.stock || 0,
        'İkon': product.imageUrl || '📦',
        'Aktif': product.isActive,
        'Yeni Ürün': product.isNewProduct || false,
        'Hızlı Kargo': product.isFastShipping || false,
        'Vitrin Ürünü': product.isShowcase || false,
        'Sıra': product.order || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');

    // Excel dosyasını indir
    XLSX.writeFile(wb, `urunler_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Toplu Ürün İşlemleri</h2>
      
      {/* Excel İşlemleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Excel Import */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiUpload className="mr-2" />
            Excel'den Ürün İçe Aktarma
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Excel Formatı</h4>
              <p className="text-sm text-blue-700 mb-3">
                Excel dosyanızda aşağıdaki sütunlar bulunmalıdır:
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <div><strong>Zorunlu:</strong> Ürün Adı, Satış Fiyatı, Kategori</div>
                <div><strong>Opsiyonel:</strong> Açıklama, Alış Fiyatı, Marka, Stok Kodu, Stok Miktarı, İkon</div>
                <div><strong>Durum:</strong> Aktif, Yeni Ürün, Hızlı Kargo, Vitrin Ürünü (true/false)</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={generateSampleExcel}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <FiFileText size={20} />
                <span>Örnek Excel İndir</span>
              </button>
              
              <label className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer">
                <FiUpload size={20} />
                <span>{isImporting ? 'İçe Aktarılıyor...' : 'Excel Seç'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>

            {importResults && (
              <div className={`border rounded-lg p-4 ${
                importResults.errors.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center mb-2">
                  {importResults.errors.length > 0 ? (
                    <FiAlertCircle className="text-red-500 mr-2" />
                  ) : (
                    <FiCheck className="text-green-500 mr-2" />
                  )}
                  <span className={`font-medium ${
                    importResults.errors.length > 0 ? 'text-red-900' : 'text-green-900'
                  }`}>
                    İçe Aktarma Sonucu
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className={importResults.errors.length > 0 ? 'text-red-700' : 'text-green-700'}>
                    ✅ Başarılı: {importResults.success} / {importResults.total}
                  </div>
                  {importResults.errors.length > 0 && (
                    <div className="text-red-700">
                      ❌ Hatalar: {importResults.errors.length}
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-xs">{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Excel Export */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiDownload className="mr-2" />
            Excel'e Ürün Dışa Aktarma
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">📊 Mevcut Durum</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Toplam Ürün: <strong>{products.length}</strong></div>
                <div>Toplam Kategori: <strong>{categories.length}</strong></div>
                <div>Aktif Ürün: <strong>{products.filter(p => p.isActive).length}</strong></div>
              </div>
            </div>

            <button
              onClick={exportToExcel}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <FiDownload size={20} />
              <span>Tüm Ürünleri Excel'e Aktar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mevcut Kategoriler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Mevcut Kategoriler</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(category => (
            <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">{category.imageUrl || '📁'}</div>
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                <div className="text-xs text-gray-500">
                  {products.filter(p => p.categoryId === category.id).length} ürün
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <p>Henüz kategori bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}











