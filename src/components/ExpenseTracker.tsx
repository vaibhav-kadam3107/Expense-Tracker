import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Wallet, DollarSign, Calendar, HelpCircle, PlusCircle, Users, Pencil, Trash2 } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

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

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setNewExpense({
      friend_name: expense.friend_name,
      amount: expense.amount.toString(),
      description: expense.description,
      type: expense.type,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
  };

  const deleteLoan = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      return;
    }

    toast.success('Expense deleted successfully');
    fetchExpenses();
  };

  const getFriendTotals = () => {
    return Object.entries(
      expenses.reduce((acc, expense) => {
        const amount = expense.type === 'GIVEN' ? expense.amount : -expense.amount;
        acc[expense.friend_name] = (acc[expense.friend_name] || 0) + amount;
        return acc;
      }, {} as Record<string, number>)
    ).map(([friendName, totalAmount]) => ({ friendName, totalAmount }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
                <p className="text-sm text-gray-500">Keep track of your shared expenses</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-900">
              {editingId ? '✏️ Edit Expense' : '💰 New Expense'}
            </h2>
            <p className="text-sm text-indigo-700 mt-1">
              {editingId ? 'Update the expense details below' : 'Record a new expense by filling out the details below'}
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label 
                    htmlFor="friendName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Friend's Name
                  </label>
                  <input
                    type="text"
                    id="friendName"
                    value={newExpense.friend_name}
                    onChange={(e) => setNewExpense({ ...newExpense, friend_name: e.target.value })}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                             transition-colors duration-200"
                    placeholder="Enter your friend's name"
                    required
                  />
                </div>

                <div>
                  <label 
                    htmlFor="amount" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="amount"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                               transition-colors duration-200"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="date" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                               focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                               transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="type" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transaction Type
                  </label>
                  <select
                    id="type"
                    value={newExpense.type}
                    onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'GIVEN' | 'RECEIVED' })}
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                             focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                             transition-colors duration-200"
                    required
                  >
                    <option value="GIVEN">Given</option>
                    <option value="RECEIVED">Received</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label 
                    htmlFor="description" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                {showHint && (
                  <div className="absolute right-0 z-10 mt-1 p-3 bg-white rounded-lg shadow-lg border border-gray-100 text-sm text-gray-600 w-64">
                    Add details about the expense such as the purpose, category, or any other relevant information.
                  </div>
                )}
                <textarea
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  rows={3}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                           focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                           transition-colors duration-200"
                  placeholder="What was this expense for?"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setNewExpense({
                        friend_name: '',
                        amount: '',
                        description: '',
                        type: 'GIVEN',
                        date: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                           transition-colors duration-200"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Friend Totals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFriendTotals().map((friend) => (
              <div
                key={friend.friendName}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-indigo-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{friend.friendName}</h3>
                <p className="text-lg font-semibold text-indigo-600">
                  ${friend.totalAmount.toFixed(2)}
                </p>
              </div>
            ))}
            {getFriendTotals().length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-4">
                No expenses recorded yet. Add your first expense above!
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense History</h2>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{expense.friend_name}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="font-semibold text-indigo-600">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(expense)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-full transition-colors"
                    title="Edit expense"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLoan(expense.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No expenses recorded yet. Add your first expense above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;