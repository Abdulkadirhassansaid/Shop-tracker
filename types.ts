
export interface Sale {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  profit: number;
}

export interface Expense {
  id:string;
  date: string;
  type: 'Stock Purchase' | 'Operating';
  description: string;
  amount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface ExpenseCategoryData {
  name: string;
  value: number;
}

export interface CapitalData {
    month: string;
    capital: number;
}

export interface InitialCapital {
    cash: number;
    stock: number;
}