import { createContext, useContext, useState, type ReactNode } from 'react';

type AppState = {
  isReady: boolean;
};

type AppContextValue = AppState & {
  setReady: (ready: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  return (
    <AppContext.Provider value={{ isReady, setReady: setIsReady }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
