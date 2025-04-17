"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface AppContextType {
  showModeSwitcher: boolean;
  setShowModeSwitcher: (show: boolean) => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  showModeSwitcher: true,
  setShowModeSwitcher: () => {},
});

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [showModeSwitcher, setShowModeSwitcher] = useState<boolean>(true);

  return (
    <AppContext.Provider value={{ showModeSwitcher, setShowModeSwitcher }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  return useContext(AppContext);
}
