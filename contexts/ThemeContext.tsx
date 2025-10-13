'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'tr' | 'en' | 'de';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('tr');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Mounting kontrolü
  useEffect(() => {
    setMounted(true);
    
    // Load theme and language from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedLanguage = localStorage.getItem('language') as Language | null;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;

    setActualTheme(effectiveTheme);
    
    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-gray-50', 'text-gray-900');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      document.body.classList.add('bg-gray-50', 'text-gray-900');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    // Save language to localStorage
    localStorage.setItem('language', language);
  }, [language, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setThemeState(current => current === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, language, setTheme, setLanguage, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

