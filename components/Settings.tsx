import React, { useState, useEffect } from 'react';
import type { InitialCapital } from '../types';
import Card from './shared/Card';
import { useCurrency } from '../hooks/useCurrency';

interface SettingsProps {
  initialCapital: InitialCapital;
  updateInitialCapital: (newCapital: InitialCapital) => void;
}

const Settings: React.FC<SettingsProps> = ({ initialCapital, updateInitialCapital }) => {
  const { currency, setCurrency, exchangeRate, setExchangeRate, formatCurrency, convertToSelected, convertFromSelected } = useCurrency();
  const [formData, setFormData] = useState<InitialCapital>({
    cash: convertToSelected(initialCapital.cash),
    stock: convertToSelected(initialCapital.stock),
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData({
      cash: convertToSelected(initialCapital.cash),
      stock: convertToSelected(initialCapital.stock),
    });
  }, [currency, initialCapital, convertToSelected]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCapitalInUsd = {
      cash: convertFromSelected(formData.cash),
      stock: convertFromSelected(formData.stock),
    };
    updateInitialCapital(newCapitalInUsd);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h2>

       <Card title="General Settings">
        <div className="space-y-6">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
             <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
              Choose the currency for displaying all financial data.
            </p>
            <select
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'USD' | 'MZN')}
              className="mt-1 block w-full max-w-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - United States Dollar</option>
              <option value="MZN">MZN - Mozambican Metical</option>
            </select>
          </div>
           {currency === 'MZN' && (
            <div>
              <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exchange Rate</label>
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                Set the conversion rate from USD to MZN.
              </p>
              <div className="mt-1 relative rounded-md shadow-sm flex items-center max-w-xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                  1 USD =
                </span>
                <input
                  type="number"
                  name="exchangeRate"
                  id="exchangeRate"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="flex-1 block w-full rounded-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  step="0.01"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                  MZN
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Initial Capital Setup">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Set the starting financial values for your shop. This is the baseline for all capital tracking and reports.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cash" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Cash</label>
              <input 
                type="number" 
                name="cash" 
                min="0" 
                step="0.01" 
                value={formData.cash} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Stock Value</label>
              <input 
                type="number" 
                name="stock" 
                min="0" 
                step="0.01" 
                value={formData.stock} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

           <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Initial Capital:</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(initialCapital.cash + initialCapital.stock)}</p>
            </div>

          <div className="flex items-center justify-end pt-4">
             {isSaved && <span className="text-green-600 dark:text-green-400 mr-4">Saved successfully!</span>}
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;