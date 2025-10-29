import React, { useState, useEffect } from 'react';
import type { Sale, InventoryItem } from '../types';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { useCurrency } from '../hooks/useCurrency';

interface SalesProps {
  sales: Sale[];
  inventory: InventoryItem[];
  addSale: (sale: Omit<Sale, 'id' | 'profit'>, inventoryItemId?: string) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
}

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  itemName: '',
  quantity: 1,
  costPrice: 0,
  salePrice: 0,
};

const Sales: React.FC<SalesProps> = ({ sales, inventory, addSale, updateSale, deleteSale }) => {
  const { formatCurrency, convertToSelected, convertFromSelected, getSymbol } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editingSale) {
      setFormData({
        date: editingSale.date,
        itemName: editingSale.itemName,
        quantity: editingSale.quantity,
        costPrice: convertToSelected(editingSale.costPrice),
        salePrice: convertToSelected(editingSale.salePrice),
      });
      setSelectedInventoryItemId(undefined);
    } else {
      setFormData(initialFormData);
    }
  }, [editingSale, convertToSelected]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'costPrice' || name === 'salePrice' ? parseFloat(value) : value }));
  };

  const handleInventoryItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    const selectedItem = inventory.find(item => item.id === itemId);
    if (selectedItem) {
        setSelectedInventoryItemId(selectedItem.id);
        setFormData(prev => ({
            ...prev,
            itemName: selectedItem.name,
            costPrice: convertToSelected(selectedItem.costPrice),
            salePrice: convertToSelected(selectedItem.sellingPrice),
            quantity: 1,
        }));
    } else {
        setSelectedInventoryItemId(undefined);
        setFormData(prev => ({
            ...prev,
            itemName: '',
            costPrice: 0,
            salePrice: 0,
        }));
    }
  };
  
  const handleOpenModal = (sale: Sale | null) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData(initialFormData);
    setSelectedInventoryItemId(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.itemName && formData.quantity > 0 && formData.costPrice >= 0 && formData.salePrice >= 0) {
      const saleDataInUsd = {
        date: formData.date,
        itemName: formData.itemName,
        quantity: formData.quantity,
        costPrice: convertFromSelected(formData.costPrice),
        salePrice: convertFromSelected(formData.salePrice),
      };

      if(editingSale) {
        updateSale({ ...editingSale, ...saleDataInUsd });
      } else {
        addSale(saleDataInUsd, selectedInventoryItemId);
      }
      handleCloseModal();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
        deleteSale(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Sales Records</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Sale
        </button>
      </div>

      <Card title="All Sales">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left">
            <thead className="border-b dark:border-gray-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Item</th>
                <th className="p-3 hidden sm:table-cell">Qty</th>
                <th className="p-3 hidden md:table-cell">Sale Price</th>
                <th className="p-3">Profit</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3">{sale.date}</td>
                  <td className="p-3 font-medium">{sale.itemName}</td>
                  <td className="p-3 hidden sm:table-cell">{sale.quantity}</td>
                  <td className="p-3 hidden md:table-cell">{formatCurrency(sale.salePrice)}</td>
                  <td className="p-3 font-semibold text-green-600 dark:text-green-400">{formatCurrency(sale.profit)}</td>
                  <td className="p-3 flex items-center space-x-2">
                    <button onClick={() => handleOpenModal(sale)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon/></button>
                    <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 sm:hidden">
          {sales.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No sales recorded yet.</p>}
          {sales.map(sale => (
            <div key={sale.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{sale.itemName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{sale.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenModal(sale)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon/></button>
                  <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600"><TrashIcon/></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="font-medium">{sale.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sale Price</p>
                  <p className="font-medium">{formatCurrency(sale.salePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(sale.profit)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSale ? 'Edit Sale' : 'Add New Sale'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {editingSale ? (
             <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          ) : (
            <div>
                <label htmlFor="inventoryItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Item</label>
                <select id="inventoryItem" onChange={handleInventoryItemChange} value={selectedInventoryItemId || ''} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="" disabled>-- Choose an item --</option>
                    {inventory.filter(i => i.quantity > 0).map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.quantity} in stock)</option>
                    ))}
                </select>
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
              <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price ({getSymbol()})</label>
              <input type="number" name="costPrice" min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none" readOnly={!editingSale} />
            </div>
             <div>
              <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price ({getSymbol()})</label>
              <input type="number" name="salePrice" min="0" step="0.01" value={formData.salePrice} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">{editingSale ? 'Update Sale' : 'Add Sale'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Sales;