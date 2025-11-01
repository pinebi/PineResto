'use client';

import { useState } from 'react';

interface VirtualKeyboardProps {
  isVisible: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  theme?: 'dark' | 'light';
}

export default function VirtualKeyboard({
  isVisible,
  onClose,
  onKeyPress,
  onBackspace,
  onEnter,
  theme = 'light'
}: VirtualKeyboardProps) {
  const [shiftPressed, setShiftPressed] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'letters' | 'numbers'>('letters');

  if (!isVisible) return null;

  const normalKeys = [
    ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ğ', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
    ['y', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç']
  ];

  const shiftKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Y', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
  ];

  const numberKeys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '€', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '+', '=', '%', '#', '*']
  ];

  const handleKeyPress = (key: string) => {
    if (shiftPressed && currentLayout === 'letters') {
      setShiftPressed(false);
    }
    onKeyPress(key);
  };

  const handleShift = () => {
    setShiftPressed(!shiftPressed);
  };

  const handleLayoutToggle = () => {
    setCurrentLayout(currentLayout === 'letters' ? 'numbers' : 'letters');
    setShiftPressed(false);
  };

  const keys = currentLayout === 'letters' 
    ? (shiftPressed ? shiftKeys : normalKeys)
    : numberKeys;

  return (
    <div 
      className={`virtual-keyboard-container fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
      style={{ 
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        padding: '10px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))'
      }}
      onClick={(e) => {
        // Klavye container'ına tıklanmasını durdur (propagation)
        e.stopPropagation();
      }}
    >
      {/* Keyboard Header */}
      <div className={`flex justify-between items-center mb-2 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
        <span className="text-xs font-semibold">⌨️ Sanal Klavye</span>
        <button
          onClick={onClose}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
          }`}
        >
          ✕ Kapat
        </button>
      </div>

      {/* Keyboard Keys */}
      <div className="space-y-2">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 flex-wrap">
            {row.map((key, keyIndex) => (
              <button
                key={`${rowIndex}-${keyIndex}`}
                onClick={() => handleKeyPress(key)}
                className={`flex-1 min-w-[32px] max-w-[60px] h-12 rounded-lg font-semibold text-lg transition-all transform active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
                    : 'bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 shadow-md'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom Row - Special Keys */}
        <div className="flex justify-center gap-1 flex-wrap">
          {/* Shift Key (only for letters) */}
          {currentLayout === 'letters' && (
            <button
              onClick={handleShift}
              className={`min-w-[80px] h-12 rounded-lg font-semibold transition-all transform active:scale-95 ${
                shiftPressed
                  ? theme === 'dark'
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-900 shadow-md'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              ⇧ Shift
            </button>
          )}

          {/* Space Bar */}
          <button
            onClick={() => handleKeyPress(' ')}
            className={`flex-1 min-w-[120px] h-12 rounded-lg font-semibold transition-all transform active:scale-95 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
                : 'bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 shadow-md'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            Boşluk
          </button>

          {/* Layout Toggle (Letters/Numbers) */}
          <button
            onClick={handleLayoutToggle}
            className={`min-w-[80px] h-12 rounded-lg font-semibold transition-all transform active:scale-95 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-900 shadow-md'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {currentLayout === 'letters' ? '123' : 'ABC'}
          </button>

          {/* Backspace */}
          <button
            onClick={onBackspace}
            className={`min-w-[80px] h-12 rounded-lg font-semibold transition-all transform active:scale-95 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
                : 'bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 shadow-md'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            ⌫
          </button>

          {/* Enter */}
          <button
            onClick={onEnter}
            className={`min-w-[80px] h-12 rounded-lg font-semibold transition-all transform active:scale-95 ${
              theme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            ↵
          </button>
        </div>
      </div>
    </div>
  );
}
