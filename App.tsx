import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Inventory from './components/Inventory';
import { ThemeProvider } from './hooks/useTheme';
import { CurrencyProvider } from './hooks/useCurrency';
import type { Sale, Expense, InitialCapital, InventoryItem } from './types';

export type View = 'Dashboard' | 'Sales' | 'Expenses' | 'Reports' | 'Settings' | 'Inventory';

const App: React.FC = () => {
  const [view, setView] = useState<View>('Dashboard');

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const localData = localStorage.getItem('shop-capital-sales');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse sales from localStorage", error);
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const localData = localStorage.getItem('shop-capital-expenses');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse expenses from localStorage", error);
      return [];
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const localData = localStorage.getItem('shop-capital-inventory');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse inventory from localStorage", error);
      return [];
    }
  });
  
  const [initialCapital, setInitialCapital] = useState<InitialCapital>(() => {
    try {
      const localData = localStorage.getItem('shop-capital-initial');
      return localData ? JSON.parse(localData) : { cash: 5000, stock: 2000 };
    } catch (error) {
      console.error("Could not parse initial capital from localStorage", error);
      return { cash: 5000, stock: 2000 };
    }
  });
  
  useEffect(() => {
    localStorage.setItem('shop-capital-sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('shop-capital-expenses', JSON.stringify(expenses));
  }, [expenses]);
  
  useEffect(() => {
    localStorage.setItem('shop-capital-inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('shop-capital-initial', JSON.stringify(initialCapital));
  }, [initialCapital]);


  const addSale = (sale: Omit<Sale, 'id' | 'profit'>, inventoryItemId?: string) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      profit: (sale.salePrice - sale.costPrice) * sale.quantity,
    };
    setSales(prevSales => [newSale, ...prevSales]);

    if (inventoryItemId) {
        setInventory(prevInventory => 
            prevInventory.map(item => 
                item.id === inventoryItemId 
                    ? { ...item, quantity: item.quantity - sale.quantity }
                    : item
            )
        );
    }
  };

  const updateSale = (updatedSale: Sale) => {
    const newProfit = (updatedSale.salePrice - updatedSale.costPrice) * updatedSale.quantity;
    setSales(prevSales =>
      prevSales.map(sale =>
        sale.id === updatedSale.id ? { ...updatedSale, profit: newProfit } : sale
      )
    );
  };

  const deleteSale = (id: string) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== id));
  };


  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };
  
  const updateInitialCapital = (newCapital: InitialCapital) => {
    setInitialCapital(newCapital);
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };


  const renderView = () => {
    switch (view) {
      case 'Dashboard':
        return <Dashboard sales={sales} expenses={expenses} initialCapital={initialCapital} />;
      case 'Sales':
        return <Sales sales={sales} inventory={inventory} addSale={addSale} updateSale={updateSale} deleteSale={deleteSale} />;
      case 'Expenses':
        return <Expenses expenses={expenses} addExpense={addExpense} updateExpense={updateExpense} deleteExpense={deleteExpense}/>;
      case 'Inventory':
        return <Inventory inventory={inventory} addInventoryItem={addInventoryItem} updateInventoryItem={updateInventoryItem} deleteInventoryItem={deleteInventoryItem} />;
      case 'Reports':
        return <Reports sales={sales} expenses={expenses} initialCapital={initialCapital} />;
      case 'Settings':
        return <Settings initialCapital={initialCapital} updateInitialCapital={updateInitialCapital} />;
      default:
        return <Dashboard sales={sales} expenses={expenses} initialCapital={initialCapital} />;
    }
  };

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="flex flex-col md:flex-row h-screen font-sans">
          <Sidebar currentView={view} setView={setView} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {renderView()}
          </main>
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;