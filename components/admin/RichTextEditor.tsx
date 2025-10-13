'use client';

import { useState } from 'react';
import { 
  FiBold, 
  FiItalic, 
  FiLink, 
  FiList, 
  FiAlignLeft, 
  FiAlignCenter, 
  FiAlignRight,
  FiImage,
  FiRotateCcw,
  FiRotateCw,
  FiTable
} from 'react-icons/fi';

interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Metin yazın...',
  className = ''
}: RichTextEditorProps) {
  const [text, setText] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    onChange?.(newValue);
  };

  const insertTag = (tag: string) => {
    const textarea = document.getElementById('rich-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let newText = '';
    switch (tag) {
      case 'bold':
        newText = text.substring(0, start) + `**${selectedText || 'kalın metin'}**` + text.substring(end);
        break;
      case 'italic':
        newText = text.substring(0, start) + `*${selectedText || 'italik metin'}*` + text.substring(end);
        break;
      case 'link':
        const url = prompt('Link URL\'sini girin:');
        if (url) {
          newText = text.substring(0, start) + `[${selectedText || 'link metni'}](${url})` + text.substring(end);
        } else {
          return;
        }
        break;
      case 'list':
        newText = text.substring(0, start) + `\n- ${selectedText || 'liste öğesi'}\n` + text.substring(end);
        break;
      case 'numberlist':
        newText = text.substring(0, start) + `\n1. ${selectedText || 'numaralı liste öğesi'}\n` + text.substring(end);
        break;
      case 'image':
        const imageUrl = prompt('Resim URL\'sini girin:');
        if (imageUrl) {
          newText = text.substring(0, start) + `\n![resim açıklaması](${imageUrl})\n` + text.substring(end);
        } else {
          return;
        }
        break;
      case 'quote':
        newText = text.substring(0, start) + `\n> ${selectedText || 'alıntı metni'}\n` + text.substring(end);
        break;
      case 'table':
        const tableText = `
| Başlık 1 | Başlık 2 | Başlık 3 |
|----------|----------|----------|
| Hücre 1  | Hücre 2  | Hücre 3  |
| Hücre 4  | Hücre 5  | Hücre 6  |
`;
        newText = text.substring(0, start) + tableText + text.substring(end);
        break;
    }
    
    setText(newText);
    onChange?.(newText);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length - text.length, start + newText.length - text.length);
    }, 0);
  };

  const renderMarkdown = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2">')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-2 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => insertTag('bold')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Kalın"
          >
            <FiBold size={16} />
          </button>
          <button
            onClick={() => insertTag('italic')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="İtalik"
          >
            <FiItalic size={16} />
          </button>
        </div>

        {/* Link */}
        <button
          onClick={() => insertTag('link')}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Link Ekle"
        >
          <FiLink size={16} />
        </button>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => insertTag('list')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Madde İşaretli Liste"
          >
            <FiList size={16} />
          </button>
          <button
            onClick={() => insertTag('numberlist')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Numaralı Liste"
          >
            <div className="w-4 h-4 flex flex-col justify-center items-center">
              <div className="text-xs font-bold">1.</div>
            </div>
          </button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => insertTag('image')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Resim Ekle"
          >
            <FiImage size={16} />
          </button>
          <button
            onClick={() => insertTag('quote')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Alıntı"
          >
            <span className="text-sm font-bold">"</span>
          </button>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => insertTag('table')}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Tablo Ekle"
          >
            <FiTable size={16} />
          </button>
        </div>

        {/* Help */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Markdown destekli:</span> **kalın**, *italik*, [link](url), ![](resim), > alıntı
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <textarea
          id="rich-textarea"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full min-h-[200px] p-4 border-0 focus:outline-none resize-none"
          style={{ fontFamily: 'monospace' }}
        />
      </div>

      {/* Preview */}
      {text && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Önizleme:</div>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
          />
        </div>
      )}
    </div>
  );
}