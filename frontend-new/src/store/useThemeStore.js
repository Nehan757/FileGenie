import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: true, // Default to dark mode
      
      toggleTheme: () => {
        const newTheme = !get().isDark;
        set({ isDark: newTheme });
        
        // Update document class
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setTheme: (isDark) => {
        set({ isDark });
        
        // Update document class
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      initializeTheme: () => {
        const { isDark } = get();
        
        // Apply theme on initialization
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useThemeStore;