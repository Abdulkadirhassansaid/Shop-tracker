import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'MZN';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  formatCurrency: (amountInUsd: number) => string;
  convertFromSelected: (amountInSelected: number) => number;
  convertToSelected: (amountInUsd: number) => number;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const storedCurrency = localStorage.getItem('shop-capital-currency') as Currency;
    return storedCurrency || 'USD';
  });
  
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const storedRate = localStorage.getItem('shop-capital-exchangeRate');
    return storedRate ? parseFloat(storedRate) : 64.0;
  });

  useEffect(() => {
    localStorage.setItem('shop-capital-currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('shop-capital-exchangeRate', exchangeRate.toString());
  }, [exchangeRate]);

  const getSymbol = () => (currency === 'USD' ? '$' : 'MT');
  
  const convertToSelected = (amountInUsd: number) => {
      if (currency === 'MZN') {
          return amountInUsd * exchangeRate;
      }
      return amountInUsd;
  };

  const convertFromSelected = (amountInSelected: number) => {
      if (currency === 'MZN') {
          return amountInSelected / exchangeRate;
      }
      return amountInSelected;
  };

  const formatCurrency = (amountInUsd: number): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountInUsd);
    }
    const amountInMzn = amountInUsd * exchangeRate;
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amountInMzn);
  };
  
  const value = { 
    currency, 
    setCurrency, 
    exchangeRate,
    setExchangeRate, 
    formatCurrency, 
    convertFromSelected, 
    convertToSelected, 
    getSymbol 
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};