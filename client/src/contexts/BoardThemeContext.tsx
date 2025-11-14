import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

export type BoardTheme = 'default' | 'classic' | 'gold' | 'rainbow';

interface BoardThemeContextType {
  theme: BoardTheme;
  setTheme: (theme: BoardTheme) => void;
  availableThemes: BoardTheme[];
  isThemeUnlocked: (theme: BoardTheme) => boolean;
}

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined);

const THEME_PRODUCT_MAP: Record<BoardTheme, string | null> = {
  default: null, // ฟรี
  classic: 'theme_classic',
  gold: 'theme_gold',
  rainbow: 'theme_rainbow',
};

export function BoardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BoardTheme>('default');
  const [unlockedThemes, setUnlockedThemes] = useState<Set<BoardTheme>>(new Set<BoardTheme>(['default']));

  const { data: purchases } = trpc.payment.myPurchases.useQuery();

  useEffect(() => {
    // โหลดธีมที่บันทึกไว้
    const savedTheme = localStorage.getItem('boardTheme') as BoardTheme;
    if (savedTheme && unlockedThemes.has(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, [unlockedThemes]);

  useEffect(() => {
    // อัพเดทธีมที่ปลดล็อกแล้ว
    if (purchases) {
      const unlocked = new Set<BoardTheme>(['default']);
      purchases.forEach((purchase) => {
        const theme = Object.entries(THEME_PRODUCT_MAP).find(
          ([_, productId]) => productId === purchase.productId
        )?.[0] as BoardTheme;
        if (theme) {
          unlocked.add(theme);
        }
      });
      setUnlockedThemes(unlocked);
    }
  }, [purchases]);

  const setTheme = (newTheme: BoardTheme) => {
    if (unlockedThemes.has(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('boardTheme', newTheme);
    }
  };

  const isThemeUnlocked = (theme: BoardTheme) => {
    return unlockedThemes.has(theme);
  };

  const availableThemes: BoardTheme[] = ['default', 'classic', 'gold', 'rainbow'];

  return (
    <BoardThemeContext.Provider value={{ theme, setTheme, availableThemes, isThemeUnlocked }}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme() {
  const context = useContext(BoardThemeContext);
  if (!context) {
    throw new Error('useBoardTheme must be used within BoardThemeProvider');
  }
  return context;
}

// ฟังก์ชันสำหรับดึงสีของธีม
export function getThemeColors(theme: BoardTheme) {
  switch (theme) {
    case 'classic':
      return {
        board: 'bg-emerald-800',
        cell: 'bg-emerald-700 border-emerald-600',
        tile: 'bg-amber-100 border-amber-300 text-amber-900',
        double_letter: 'bg-sky-400 text-white',
        triple_letter: 'bg-blue-600 text-white',
        double_word: 'bg-pink-400 text-white',
        triple_word: 'bg-red-600 text-white',
        center: 'bg-pink-500 text-white',
      };
    case 'gold':
      return {
        board: 'bg-gradient-to-br from-yellow-800 to-yellow-900',
        cell: 'bg-yellow-700 border-yellow-600',
        tile: 'bg-yellow-50 border-yellow-400 text-yellow-900',
        double_letter: 'bg-yellow-400 text-yellow-900',
        triple_letter: 'bg-yellow-600 text-white',
        double_word: 'bg-orange-400 text-white',
        triple_word: 'bg-orange-600 text-white',
        center: 'bg-amber-500 text-white',
      };
    case 'rainbow':
      return {
        board: 'bg-gradient-to-br from-purple-600 to-pink-600',
        cell: 'bg-white/20 border-white/30',
        tile: 'bg-white border-purple-300 text-purple-900',
        double_letter: 'bg-cyan-400 text-white',
        triple_letter: 'bg-blue-500 text-white',
        double_word: 'bg-pink-400 text-white',
        triple_word: 'bg-purple-600 text-white',
        center: 'bg-gradient-to-br from-pink-500 to-purple-500 text-white',
      };
    default: // default theme
      return {
        board: 'bg-green-800',
        cell: 'bg-green-700 border-green-600',
        tile: 'bg-amber-50 border-amber-200 text-amber-900',
        double_letter: 'bg-blue-400 text-white',
        triple_letter: 'bg-blue-600 text-white',
        double_word: 'bg-pink-400 text-white',
        triple_word: 'bg-red-600 text-white',
        center: 'bg-pink-500 text-white',
      };
  }
}
