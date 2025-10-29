import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import Card from './shared/Card';
import Modal from './shared/Modal';
import { useCurrency } from '../hooks/useCurrency';

interface ExpensesProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  type: 'Operating' as 'Stock Purchase' | 'Operating',
  description: '',
  amount: 0,
};

const Expenses: React.FC<ExpensesProps> = ({ expenses, addExpense, updateExpense, deleteExpense }) => {
  const { formatCurrency, convertToSelected, convertFromSelected, getSymbol } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        date: editingExpense.date,
        type: editingExpense.type,
        description: editingExpense.description,
        amount: convertToSelected(editingExpense.amount),
      });
    } else {
        setFormData(initialFormData);
    }
  }, [editingExpense, convertToSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };
  
  const handleOpenModal = (expense: Expense | null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description && formData.amount > 0) {
      const expenseDataInUsd = {
        date: formData.date,
        type: formData.type,
        description: formData.description,
        amount: convertFromSelected(formData.amount),
      };

      if (editingExpense) {
        updateExpense({ ...editingExpense, ...expenseDataInUsd });
      } else {
        addExpense(expenseDataInUsd);
      }
      handleCloseModal();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
        deleteExpense(id);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Expenses Records</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Expense
        </button>
      </div>

      <Card title="All Expenses">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left">
            <thead className="border-b dark:border-gray-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3 hidden sm:table-cell">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3">{expense.date}</td>
                  <td className="p-3 font-medium">{expense.description}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.type === 'Stock Purchase'
                        ? 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200'
                        : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
                    }`}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</td>
                   <td className="p-3 flex items-center space-x-2">
                    <button onClick={() => handleOpenModal(expense)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon/></button>
                    <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 sm:hidden">
          {expenses.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No expenses recorded yet.</p>}
          {expenses.map(expense => (
             <div key={expense.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{expense.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModal(expense)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600"><EditIcon/></button>
                        <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600"><TrashIcon/></button>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        expense.type === 'Stock Purchase'
                            ? 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200'
                            : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
                        }`}>
                        {expense.type}
                    </span>
                    <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
                </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({getSymbol()})</label>
              <input type="number" name="amount" min="0" step="0.01" value={formData.amount} onChange={handleInputChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option>Operating</option>
              <option>Stock Purchase</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold mr-2 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">{editingExpense ? 'Update Expense' : 'Add Expense'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default Expenses;