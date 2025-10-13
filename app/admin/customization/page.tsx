'use client';

import { useState } from 'react';
import { FiUpload, FiSave, FiRefreshCw } from 'react-icons/fi';

export default function CustomizationPage() {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [logoUrl, setLogoUrl] = useState('');
  const [restaurantName, setRestaurantName] = useState('Restoran Kiosk');

  const colorPresets = [
    { name: 'Mavi', primary: '#3b82f6', secondary: '#10b981' },
    { name: 'Yeşil', primary: '#10b981', secondary: '#3b82f6' },
    { name: 'Mor', primary: '#8b5cf6', secondary: '#ec4899' },
    { name: 'Turuncu', primary: '#f59e0b', secondary: '#ef4444' },
    { name: 'Kırmızı', primary: '#ef4444', secondary: '#f59e0b' },
    { name: 'Lacivert', primary: '#1e40af', secondary: '#0891b2' },
  ];

  const fonts = [
    'Inter',
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
  ];

  const handleSaveCustomization = () => {
    const customization = {
      primaryColor,
      secondaryColor,
      fontFamily,
      logoUrl,
      restaurantName,
    };
    localStorage.setItem('restaurantCustomization', JSON.stringify(customization));
    
    // CSS değişkenlerini güncelle
    document.documentElement.style.setProperty('--primary-500', primaryColor);
    document.documentElement.style.setProperty('--secondary-500', secondaryColor);
    document.body.style.fontFamily = fontFamily;

    alert('✅ Özelleştirme kaydedildi!');
  };

  const handleReset = () => {
    if (confirm('Varsayılan ayarlara dönmek istediğinizden emin misiniz?')) {
      setPrimaryColor('#3b82f6');
      setSecondaryColor('#10b981');
      setFontFamily('Inter');
      setLogoUrl('');
      setRestaurantName('Restoran Kiosk');
      localStorage.removeItem('restaurantCustomization');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tema Özelleştirme</h2>
          <p className="text-gray-600 mt-1">Marka kimliğinizi yansıtan özel tema oluşturun</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Sıfırla
          </button>
          <button
            onClick={handleSaveCustomization}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <FiSave className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo ve Marka</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restoran Adı
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                    <FiUpload className="w-4 h-4" />
                    Yükle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Renk Paleti</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana Renk
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkincil Renk
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hazır Renk Paletleri
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: preset.primary }}
                      ></div>
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipografi</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Ailesi
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {fonts.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Önizleme:</div>
              <div style={{ fontFamily }}>
                <h4 className="text-2xl font-bold mb-2">{restaurantName}</h4>
                <p className="text-gray-600">Modern Self-Servis Sipariş Sistemi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Canlı Önizleme</h3>
            
            <div className="space-y-4">
              {/* Header Preview */}
              <div
                className="rounded-lg p-4 text-white"
                style={{ backgroundColor: primaryColor, fontFamily }}
              >
                <div className="text-xl font-bold">{restaurantName}</div>
                <div className="text-sm opacity-90 mt-1">Admin Panel</div>
              </div>

              {/* Button Preview */}
              <button
                className="w-full py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: primaryColor, fontFamily }}
              >
                Ana Buton
              </button>

              <button
                className="w-full py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: secondaryColor, fontFamily }}
              >
                İkincil Buton
              </button>

              {/* Card Preview */}
              <div className="border-2 rounded-lg p-4" style={{ borderColor: primaryColor, fontFamily }}>
                <div className="font-bold mb-2" style={{ color: primaryColor }}>
                  Kart Başlığı
                </div>
                <div className="text-sm text-gray-600">
                  Tema önizleme kartı örneği
                </div>
              </div>

              {/* Badge Preview */}
              <div className="flex gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Aktif
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Başarılı
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






