import React, { useMemo } from 'react';
import type { Sale, Expense, InitialCapital } from '../types';
import Card from './shared/Card';
import { useCurrency } from '../hooks/useCurrency';

interface ReportsProps {
  sales: Sale[];
  expenses: Expense[];
  initialCapital: InitialCapital;
}

const Reports: React.FC<ReportsProps> = ({ sales, expenses, initialCapital }) => {
  const { formatCurrency } = useCurrency();

  const monthlyReports = useMemo(() => {
    const reports: { [key: string]: { sales: number; expenses: number; profit: number; monthYear: string } } = {};
    
    [...sales, ...expenses].forEach(item => {
      const date = new Date(item.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!reports[monthYear]) {
        reports[monthYear] = { sales: 0, expenses: 0, profit: 0, monthYear };
      }
    });

    sales.forEach(sale => {
      const monthYear = new Date(sale.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      reports[monthYear].sales += sale.salePrice * sale.quantity;
      reports[monthYear].profit += sale.profit;
    });

    expenses.forEach(expense => {
      const monthYear = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      reports[monthYear].expenses += expense.amount;
    });
    
    Object.values(reports).forEach(report => {
        report.profit -= report.expenses;
    });

    const sortedReports = Object.values(reports).sort((a,b) => new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime());

    let runningCapital = initialCapital.cash + initialCapital.stock;
    const reportsWithCapital = sortedReports.map(report => {
        const capitalStart = runningCapital;
        runningCapital += report.profit;
        const capitalGrowth = runningCapital - capitalStart;
        return { ...report, capitalGrowth };
    });

    return reportsWithCapital.reverse(); // Show most recent first
  }, [sales, expenses, initialCapital]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Monthly Reports</h2>
      
      <div className="space-y-6">
        {monthlyReports.length > 0 ? monthlyReports.map(report => (
            <Card key={report.monthYear} title={report.monthYear}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                  <p className="text-xl font-bold">{formatCurrency(report.sales)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-xl font-bold">{formatCurrency(report.expenses)}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
                  <p className={`text-xl font-bold ${report.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(report.profit)}
                  </p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capital Growth</p>
                  <p className={`text-xl font-bold ${report.capitalGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(report.capitalGrowth)}
                  </p>
                </div>
              </div>
            </Card>
          )
        ) : (
          <Card title="No Reports Yet">
            <p>No sales or expenses have been recorded yet. Add some to see your monthly reports.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;