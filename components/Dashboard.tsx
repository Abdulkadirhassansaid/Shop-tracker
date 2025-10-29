import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from './shared/Card';
import type { Sale, Expense, MonthlyData, ExpenseCategoryData, CapitalData, InitialCapital } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useCurrency } from '../hooks/useCurrency';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  initialCapital: InitialCapital;
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, initialCapital }) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
  
  const {
    totalCapital,
    todaysSales,
    todaysExpenses,
    todaysProfit,
    monthlyProfitData,
    expenseCategoryData,
    capitalGrowthPercentage,
    capitalHistory,
  } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const todaysSalesValue = sales
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.salePrice * s.quantity, 0);

    const todaysExpensesValue = expenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);

    const todaysProfitValue = sales
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.profit, 0) - todaysExpensesValue;
    
    const totalStockPurchases = expenses
        .filter(e => e.type === 'Stock Purchase')
        .reduce((sum, e) => sum + e.amount, 0);
    const totalStockValue = initialCapital.stock + totalStockPurchases;

    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalOperatingExpenses = expenses
        .filter(e => e.type === 'Operating')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const currentCash = initialCapital.cash + totalProfit - totalOperatingExpenses - totalStockPurchases;
    const totalCapitalValue = currentCash + totalStockValue;

    const monthlyProfitData: MonthlyData[] = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          sales: 0,
          expenses: 0,
          profit: 0,
        };
      }).reverse().map(data => {
        const monthSales = sales
          .filter(s => {
              const sDate = new Date(s.date);
              return sDate.toLocaleString('default', { month: 'short' }) === data.month && sDate.getFullYear() === data.year;
          })
          .reduce((sum, s) => sum + s.profit, 0);
        const monthExpenses = expenses
          .filter(e => {
              const eDate = new Date(e.date);
              return eDate.toLocaleString('default', { month: 'short' }) === data.month && eDate.getFullYear() === data.year;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        
        return { ...data, sales: monthSales + monthExpenses, expenses: monthExpenses, profit: monthSales - monthExpenses };
    });
    
    const expenseCategories = expenses.reduce((acc, expense) => {
      const category = expense.type === 'Stock Purchase' ? 'Stock' : expense.description;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    const expenseCategoryData: ExpenseCategoryData[] = Object.keys(expenseCategories).map((name) => ({ name, value: expenseCategories[name] }));

    const startCapital = initialCapital.cash + initialCapital.stock;
    const capitalGrowthPercentage = startCapital > 0 ? ((totalCapitalValue - startCapital) / startCapital) * 100 : 0;

    // Calculate Capital History for the chart
    const profitsBeforePeriod = sales
        .filter(s => new Date(s.date) < new Date(new Date().setMonth(new Date().getMonth() - 6)))
        .reduce((sum, s) => sum + s.profit, 0);
    const expensesBeforePeriod = expenses
        .filter(e => new Date(e.date) < new Date(new Date().setMonth(new Date().getMonth() - 6)))
        .reduce((sum, e) => sum + e.amount, 0);

    const capitalAtStartOfPeriod = startCapital + profitsBeforePeriod - expensesBeforePeriod;
    
    let runningCapital = capitalAtStartOfPeriod;
    const capitalHistory: CapitalData[] = monthlyProfitData.map(data => {
        runningCapital += data.profit;
        return {
            month: data.month,
            capital: runningCapital
        };
    });

    return { totalCapital: totalCapitalValue, todaysSales: todaysSalesValue, todaysExpenses: todaysExpensesValue, todaysProfit: todaysProfitValue, monthlyProfitData, expenseCategoryData, capitalGrowthPercentage, capitalHistory };
  }, [sales, expenses, initialCapital]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Capital">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalCapital)}</p>
          <div className={`flex items-center mt-2 ${capitalGrowthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {capitalGrowthPercentage >= 0 ? <TrendingUpIcon/> : <TrendingDownIcon/>}
            <span className="ml-1 text-sm font-medium">{capitalGrowthPercentage.toFixed(2)}% total growth</span>
          </div>
        </Card>
        <Card title="Today's Sales">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(todaysSales)}</p>
        </Card>
        <Card title="Today's Expenses">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(todaysExpenses)}</p>
        </Card>
        <Card title="Today's Profit">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(todaysProfit)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card title="Monthly Profit (Last 6 Months)">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyProfitData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
                        <XAxis dataKey="month" stroke={tickColor} />
                        <YAxis stroke={tickColor} tickFormatter={(value) => formatCurrency(value as number)} />
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value) => formatCurrency(value as number)}/>
                        <Legend />
                        <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Expense Breakdown">
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={expenseCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {expenseCategoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 gap-6">
        <div>
          <Card title="Capital Growth (Last 6 Months)">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={capitalHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
                        <XAxis dataKey="month" stroke={tickColor} />
                        <YAxis stroke={tickColor} domain={['dataMin - 500', 'dataMax + 500']} tickFormatter={(value) => formatCurrency(value as number)} />
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', border: '1px solid #4A5568' }} formatter={(value) => formatCurrency(value as number)}/>
                        <Legend />
                        <Line type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;

export default Dashboard;