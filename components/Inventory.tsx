import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../types';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { useCurrency } from '../hooks/useCurrency';

interface InventoryProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
}

const LOW_STOCK_THRESHOLD = 5;

const initialFormData = {
  name: '',
  quantity: 0,
  costPrice: 0,
  sellingPrice: 0,
};

const Inventory: React.FC<InventoryProps> = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem }) => {
  const { formatCurrency, convertToSelected, convertFromSelected, getSymbol } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        quantity: editingItem.quantity,
        costPrice: convertToSelected(editingItem.costPrice),
        sellingPrice: convertToSelected(editingItem.sellingPrice),
      });
    } else {
        setFormData(initialFormData);
    }
  }, [editingItem, convertToSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : parseFloat(value) }));
  };
  
  const handleOpenModal = (item: InventoryItem | null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity >= 0 && formData.costPrice >= 0 && formData.sellingPrice >= 0) {
       const itemDataInUsd = {
        name: formData.name,
        quantity: formData.quantity,
        costPrice: convertFromSelected(formData.costPrice),
        sellingPrice: convertFromSelected(formData.sellingPrice),
      };

      if (editingItem) {
        updateInventoryItem({ ...editingItem, ...itemDataInUsd });
      } else {
        addInventoryItem(itemDataInUsd);
      }
      handleCloseModal();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        deleteInventoryItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory Management</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Item
        </button>
      </div>

      <Card title="Stock Items">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left">
            <thead className="border-b dark:border-gray-700">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Profit per Item</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">
                    {item.quantity}
                    {item.quantity <= LOW_STOCK_THRESHOLD && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200">
                            Low Stock
                        </span>
                    )}
                  </td>
                  <td className="p-3">{formatCurrency(item.costPrice)}</td>
                  <td className="p-3">{formatCurrency(item.sellingPrice)}</td>
                  <td className="p-3 font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.sellingPrice - item.costPrice)}</td>
                  <td className="p-3 flex items-center space-x-2">
                    <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon/></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 sm:hidden">
            {inventory.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No items in inventory.</p>}
            {inventory.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity}
                                {item.quantity <= LOW_STOCK_THRESHOLD && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200">
                                        Low Stock
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon/></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600"><TrashIcon/></button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cost</p>
                            <p className="font-medium">{formatCurrency(item.costPrice)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Selling</p>
                            <p className="font-medium">{formatCurrency(item.sellingPrice)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.sellingPrice - item.costPrice)}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Item' : 'Add New Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
              <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Price ({getSymbol()})</label>
              <input type="number" name="costPrice" min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price ({getSymbol()})</label>
              <input type="number" name="sellingPrice" min="0" step="0.01" value={formData.sellingPrice} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">{editingItem ? 'Update Item' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Inventory;