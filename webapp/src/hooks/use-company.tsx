// companyContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context
type CompanyContextType = {
  company: string;
  setCompany: (company: string) => void;
};

// Create the context with default values
const CompanyContext = createContext<CompanyContextType>({
  company: "",
  setCompany: () => {},
});

// Create a provider component
export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<string>("");

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

// Create a custom hook to use the context
export function useCompany() {
  return useContext(CompanyContext);
}