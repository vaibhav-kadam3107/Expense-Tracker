import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Receipt, Plus, HelpCircle, Coins } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

interface Expense {
  id: string;
  friend_name: string;
  amount: number;
  description: string;
  type: 'GIVEN' | 'RECEIVED';
  date: string;
}

function ExpenseTracker() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    friend_name: '',
    amount: '',
    description: '',
    type: 'GIVEN' as const,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  const fetchExpenses = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
      return;
    }

    setExpenses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !newExpense.friend_name || !newExpense.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    const expenseData = {
      user_id: user.id,
      friend_name: newExpense.friend_name,
      amount: amount,
      description: newExpense.description,
      type: newExpense.type,
      date: new Date(newExpense.date).toISOString()
    };

    const { error } = await supabase
      .from('expenses')
      .insert([expenseData]);

    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return;
    }

    toast.success('Expense added successfully');
    setNewExpense({
      friend_name: '',
      amount: '',
      description: '',
      type: 'GIVEN',
      date: new Date().toISOString().split('T')[0]
    });
    fetchExpenses();
  };

  const calculateTotal = () => {
    return expenses.reduce((total, expense) => {
      return total + (expense.type === 'GIVEN' ? expense.amount : -expense.amount);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Expense Tracker</h1>
              <p className="text-sm text-gray-500">Keep track of your shared expenses</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-semibold text-indigo-600">
              ${calculateTotal().toFixed(2)}
            </p>
          </div>
        </div>

        {/* New Expense Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Coins className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-medium text-gray-900">New Expense</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Record a new expense by filling out the details below
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    value={newExpense.friend_name}
                    onChange={(e) => setNewExpense({ ...newExpense, friend_name: e.target.value })}
                    placeholder="Enter your friend's name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    title="Add details about this expense"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="What was this expense for?"
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Friend Totals */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Friend Totals</h2>
          {expenses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">
                No expenses recorded yet. Add your first expense above!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {Object.entries(
                expenses.reduce((acc, expense) => {
                  const amount = expense.type === 'GIVEN' ? expense.amount : -expense.amount;
                  acc[expense.friend_name] = (acc[expense.friend_name] || 0) + amount;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([friend, amount]) => (
                <div
                  key={friend}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-medium text-gray-900">{friend}</h3>
                  <p className={`mt-1 text-lg font-semibold ${
                    amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(amount).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {amount >= 0 ? 'to receive' : 'to pay'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense History */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expense History</h2>
          {expenses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">
                No expenses recorded yet. Add your first expense above!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <li key={expense.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          expense.type === 'GIVEN' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            expense.type === 'GIVEN' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {expense.type === 'GIVEN' ? '-' : '+'}
                          </span>
                        </div>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {expense.friend_name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {expense.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center">
                        <p className={`text-sm font-semibold ${
                          expense.type === 'GIVEN' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${expense.amount.toFixed(2)}
                        </p>
                        <p className="ml-4 text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;