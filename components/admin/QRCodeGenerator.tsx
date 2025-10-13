'use client';

import { useState } from 'react';
import { FiDownload, FiPrinter, FiCopy } from 'react-icons/fi';

interface QRCodeGeneratorProps {
  data: string;
  title: string;
  description?: string;
  size?: number;
}

export default function QRCodeGenerator({ data, title, description, size = 200 }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);

  // QR kod SVG'sini oluştur (basit implementasyon)
  const generateQRSVG = () => {
    // Gerçek QR kod için qrcode.react veya benzeri kütüphane kullanılabilir
    // Şimdilik demo QR kod gösterimi
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className="mx-auto">
        <rect width="200" height="200" fill="white" />
        <rect x="10" y="10" width="50" height="50" fill="black" />
        <rect x="140" y="10" width="50" height="50" fill="black" />
        <rect x="10" y="140" width="50" height="50" fill="black" />
        <rect x="70" y="70" width="60" height="60" fill="black" />
        <rect x="80" y="30" width="40" height="40" fill="black" />
        <rect x="30" y="80" width="20" height="20" fill="black" />
        <rect x="160" y="160" width="30" height="30" fill="black" />
        <text x="100" y="105" textAnchor="middle" fontSize="12" fill="white">QR</text>
      </svg>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // QR kodu PNG olarak indir
    alert('QR kod indiriliyor...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        {generateQRSVG()}
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-600 mb-1">URL/Veri:</div>
        <div className="text-sm font-mono text-gray-900 break-all">{data}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          İndir
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FiPrinter className="w-4 h-4" />
          Yazdır
        </button>
        <button
          onClick={handleCopy}
          className={`flex-1 ${copied ? 'bg-green-600' : 'bg-gray-500'} hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
        >
          <FiCopy className="w-4 h-4" />
          {copied ? '✓ Kopyalandı' : 'Kopyala'}
        </button>
      </div>
    </div>
  );
}






