'use client';

import { useState, useEffect } from 'react';
import { FiMic, FiMicOff, FiX } from 'react-icons/fi';

interface VoiceOrderButtonProps {
  onOrderDetected?: (text: string) => void;
}

export default function VoiceOrderButton({ onOrderDetected }: VoiceOrderButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'tr-TR';

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            onOrderDetected?.(transcriptText);
            
            // Sesli geri bildirim
            const utterance = new SpeechSynthesisUtterance(
              `Anladım, ${transcriptText}. Siparişiniz alındı.`
            );
            utterance.lang = 'tr-TR';
            window.speechSynthesis.speak(utterance);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Tarayıcınız sesli komut özelliğini desteklemiyor. Chrome veya Edge kullanın.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      recognition.start();
      setIsListening(true);
      
      // Başlangıç sesli bildirimi
      const utterance = new SpeechSynthesisUtterance('Sizi dinliyorum. Ne sipariş etmek istersiniz?');
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Voice Order Button */}
      <button
        onClick={toggleListening}
        className={`fixed bottom-24 right-6 z-40 ${
          isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
        } text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110`}
        title="Sesli Sipariş"
      >
        {isListening ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
      </button>

      {/* Listening Modal */}
      {isListening && (
        <div className="fixed bottom-44 right-6 z-40 bg-white rounded-xl shadow-2xl border-2 border-purple-500 p-6 max-w-sm animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiMic className="w-6 h-6 text-purple-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="font-bold text-gray-900">Dinliyorum...</div>
                <div className="text-xs text-gray-500">Siparişinizi söyleyin</div>
              </div>
            </div>
            <button
              onClick={toggleListening}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {transcript && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-900">{transcript}</div>
            </div>
          )}

          {!transcript && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-8 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-10 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-14 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
              <div className="w-2 h-8 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            Örnek: "İki Adana Kebap ve bir Ayran"
          </div>
        </div>
      )}
    </>
  );
}











