'use client'

import { useState, useEffect } from 'react'

export default function ExpensesView() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    food: 0,
    transport: 0,
    bills: 0,
    health: 0,
    education: 0,
    entertainment: 0,
    other: 0,
    savings: 0,
    cashBalance: 0,
    numTransactions: 1,
    notes: ''
  })

  useEffect(() => {
    loadExpenses()
    loadSummary()
  }, [])

  const loadExpenses = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/daily-expenses?limit=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
      }
    } catch (err) {
      console.error('Error loading expenses:', err)
      setError('Failed to load expenses')
    }
  }

  const loadSummary = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/daily-expenses/summary?period=month', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Error loading summary:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const url = editingExpense 
        ? `http://localhost:5000/api/daily-expenses/${editingExpense._id}`
        : 'http://localhost:5000/api/daily-expenses'
      
      const method = editingExpense ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowAddForm(false)
        setEditingExpense(null)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          food: 0, transport: 0, bills: 0, health: 0,
          education: 0, entertainment: 0, other: 0,
          savings: 0, cashBalance: 0, numTransactions: 1, notes: ''
        })
        await loadExpenses()
        await loadSummary()
      }
    } catch (err) {
      console.error('Error saving expense:', err)
      setError('Failed to save expense')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date.split('T')[0],
      food: expense.food || 0,
      transport: expense.transport || 0,
      bills: expense.bills || 0,
      health: expense.health || 0,
      education: expense.education || 0,
      entertainment: expense.entertainment || 0,
      other: expense.other || 0,
      savings: expense.savings || 0,
      cashBalance: expense.cashBalance || 0,
      numTransactions: expense.numTransactions || 1,
      notes: expense.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/daily-expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        await loadExpenses()
        await loadSummary()
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
      setError('Failed to delete expense')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTotalSpend = (expense) => {
    return (expense.food || 0) + (expense.transport || 0) + (expense.bills || 0) + 
           (expense.health || 0) + (expense.education || 0) + (expense.entertainment || 0) + 
           (expense.other || 0)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Expenses</h2>
        <p className="text-slate-400">Fetching your expense data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <style jsx global>{`
        .glass-morphism {
          background: rgba(15, 15, 24, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
      `}</style>

      {}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Spend</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalSpend)}</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.averageDaily)}</p>
              <p className="text-xs text-slate-500 mt-1">Per day</p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Savings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-white">{summary.expenseCount}</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </div>
        </div>
      )}

      {}
      {summary?.categoryBreakdown && (
        <div className="glass-morphism rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Category Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(summary.categoryBreakdown).map(([category, amount]) => {
              const percentage = summary.totalSpend > 0 ? (amount / summary.totalSpend) * 100 : 0
              const categoryColors = {
                food: 'from-red-500 to-red-600',
                transport: 'from-blue-500 to-blue-600',
                bills: 'from-yellow-500 to-yellow-600',
                health: 'from-green-500 to-green-600',
                education: 'from-purple-500 to-purple-600',
                entertainment: 'from-pink-500 to-pink-600',
                other: 'from-gray-500 to-gray-600'
              }
              
              return (
                <div key={category} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300 capitalize">{category}</span>
                    <span className="text-xs text-slate-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className={`h-2 bg-gradient-to-r ${categoryColors[category]} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-bold text-white">{formatCurrency(amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {}
      {showAddForm && (
        <div className="glass-morphism rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {editingExpense ? 'Edit Expense' : 'Add Daily Expense'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingExpense(null)
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  food: 0, transport: 0, bills: 0, health: 0,
                  education: 0, entertainment: 0, other: 0,
                  savings: 0, cashBalance: 0, numTransactions: 1, notes: ''
                })
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Transactions</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numTransactions}
                  onChange={(e) => setFormData({...formData, numTransactions: parseInt(e.target.value) || 1})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['food', 'transport', 'bills', 'health', 'education', 'entertainment', 'other'].map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{category}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[category]}
                    onChange={(e) => setFormData({...formData, [category]: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Savings</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.savings}
                  onChange={(e) => setFormData({...formData, savings: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cash Balance</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cashBalance}
                  onChange={(e) => setFormData({...formData, cashBalance: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                rows={3}
                placeholder="Optional notes about your expenses..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingExpense(null)
                }}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {}
      {!showAddForm && (
        <div className="text-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center space-x-3 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Daily Expense</span>
          </button>
        </div>
      )}

      {}
      <div className="glass-morphism rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Recent Expenses
        </h3>

        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense._id} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {new Date(expense.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <p className="text-2xl font-black text-cyan-400">{formatCurrency(getTotalSpend(expense))}</p>
                    {expense.savings > 0 && (
                      <p className="text-sm text-emerald-400 font-medium">
                        Saved: {formatCurrency(expense.savings)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries({
                    food: expense.food,
                    transport: expense.transport,
                    bills: expense.bills,
                    health: expense.health,
                    education: expense.education,
                    entertainment: expense.entertainment,
                    other: expense.other
                  }).filter(([_, amount]) => amount > 0).map(([category, amount]) => (
                    <div key={category} className="text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{category}</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                </div>

                {expense.notes && (
                  <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-300">{expense.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg">No expenses recorded yet</p>
            <p className="text-slate-500 mt-2">Start tracking your daily expenses to see insights</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}