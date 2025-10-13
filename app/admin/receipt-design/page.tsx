'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

interface Printer {
  id: string;
  name: string;
  location: string;
  ip_address: string;
  port: number;
  is_active: boolean;
}

interface ReceiptTemplate {
  id: string;
  name: string;
  printer_id: string;
  template_type: string;
  header_text: string;
  footer_text: string;
  show_logo: boolean;
  show_qr_code: boolean;
  show_table_info: boolean;
  show_order_time: boolean;
  show_estimated_time: boolean;
  item_format: string;
  is_active: boolean;
}

interface ReceiptVariable {
  id: string;
  variable_name: string;
  description: string;
  example_value: string;
  is_system: boolean;
}

export default function ReceiptDesignPage() {
  const router = useRouter();
  const [hideHeader, setHideHeader] = useState(false);
  
  useEffect(() => {
    // Check if we're being rendered inside admin panel
    setHideHeader(window.location.pathname === '/admin');
  }, []);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [variables, setVariables] = useState<ReceiptVariable[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [printersRes, templatesRes, variablesRes] = await Promise.all([
        fetch('/api/printers'),
        fetch('/api/receipt-templates'),
        fetch('/api/receipt-variables')
      ]);

      const [printersData, templatesData, variablesData] = await Promise.all([
        printersRes.json(),
        templatesRes.json(),
        variablesRes.json()
      ]);

      setPrinters(printersData);
      setTemplates(templatesData);
      setVariables(variablesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: ReceiptTemplate) => {
    setSelectedTemplate({ ...template });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      await fetch('/api/receipt-templates/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      });

      await loadData();
      setIsEditing(false);
      alert('Fiş şablonu başarıyla güncellendi!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Hata oluştu!');
    }
  };

  const insertVariable = (variable: string, target: 'header' | 'footer' | 'item') => {
    if (!selectedTemplate) return;

    const newTemplate = { ...selectedTemplate };
    
    if (target === 'header') {
      newTemplate.header_text += variable;
    } else if (target === 'footer') {
      newTemplate.footer_text += variable;
    } else if (target === 'item') {
      newTemplate.item_format += variable;
    }
    
    setSelectedTemplate(newTemplate);
  };

  const previewReceipt = () => {
    if (!selectedTemplate) return '';

    let preview = selectedTemplate.header_text
      .replace('{RESTAURANT_NAME}', 'PineResto')
      .replace('{TABLE_NUMBER}', '5')
      .replace('{ORDER_NUMBER}', '1234')
      .replace('{ORDER_DATE}', '15.01.2024')
      .replace('{ORDER_TIME}', '14:30')
      .replace('{ESTIMATED_TIME}', '25')
      + '\n\n';

    // Örnek ürün
    preview += selectedTemplate.item_format
      .replace('{ITEM_NAME}', 'Adana Kebap')
      .replace('{ITEM_DESCRIPTION}', 'Acılı kıyma kebap')
      .replace('{QUANTITY}', '2')
      .replace('{ITEM_PRICE}', '120.00')
      .replace('{TOTAL_PRICE}', '240.00')
      .replace('{OPTIONS}', 'Az Acılı, Büyük Porsiyon')
      .replace('{NOTES}', 'Soğansız olsun')
      + '\n';

    preview += selectedTemplate.footer_text
      .replace('{RESTAURANT_NAME}', 'PineResto')
      .replace('{TABLE_NUMBER}', '5')
      .replace('{ORDER_NUMBER}', '1234')
      .replace('{ORDER_DATE}', '15.01.2024')
      .replace('{ORDER_TIME}', '14:30')
      .replace('{ESTIMATED_TIME}', '25');

    return preview;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      {!hideHeader && (
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <FiArrowLeft size={24} />
                  <span className="text-lg font-semibold">Geri</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <FiHome size={24} />
                  <span className="text-lg font-semibold">Ana Sayfa</span>
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🧾 Fiş Tasarım Yönetimi</h1>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-600">80mm yazıcı için fiş şablonlarını düzenleyin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Şablon Listesi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fiş Şablonları</h2>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">
                      {printers.find(p => p.id === template.printer_id)?.name || 'Yazıcı bulunamadı'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Düzenleme Paneli */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Şablon Düzenle' : 'Şablon Görüntüle'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {isEditing ? 'İptal' : 'Düzenle'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şablon Adı
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlık Metni
                      </label>
                      <textarea
                        value={selectedTemplate.header_text}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, header_text: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Fiş başlığı..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ürün Formatı
                      </label>
                      <textarea
                        value={selectedTemplate.item_format}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, item_format: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ürün bilgileri formatı..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Bilgi Metni
                      </label>
                      <textarea
                        value={selectedTemplate.footer_text}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, footer_text: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Fiş alt bilgisi..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Önizleme</h3>
                      <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {previewReceipt()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-6xl mb-4">🧾</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Şablon Seçin</h2>
                <p className="text-gray-600">Düzenlemek için sol taraftan bir fiş şablonu seçin</p>
              </div>
            )}
          </div>
        </div>

        {/* Değişkenler Paneli */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kullanılabilir Değişkenler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variables.map((variable) => (
              <div key={variable.id} className="border border-gray-200 rounded-lg p-3">
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mb-2">
                  {variable.variable_name}
                </div>
                <div className="text-sm text-gray-600 mb-1">{variable.description}</div>
                <div className="text-xs text-gray-500">Örnek: {variable.example_value}</div>
                {isEditing && selectedTemplate && (
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => insertVariable(variable.variable_name, 'header')}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      Başlık
                    </button>
                    <button
                      onClick={() => insertVariable(variable.variable_name, 'item')}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                    >
                      Ürün
                    </button>
                    <button
                      onClick={() => insertVariable(variable.variable_name, 'footer')}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
                    >
                      Alt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
