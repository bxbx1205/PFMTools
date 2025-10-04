'use client'

import { useState, useEffect } from 'react'
import DailyExpenseForm from './DailyExpenseForm'

export default function ExpensesView({ isOpen, onClose }) {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    if (isOpen) {
      fetchExpenses()
      fetchSummary()
    }
  }, [isOpen, period])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/daily-expenses?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/daily-expenses/summary?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setShowForm(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/daily-expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchExpenses()
        fetchSummary()
      } else {
        alert('Failed to delete expense')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Failed to delete expense')
    }
  }

  const handleFormSave = (savedExpense) => {
    fetchExpenses()
    fetchSummary()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-green-500/20 text-green-400',
      transport: 'bg-blue-500/20 text-blue-400',
      bills: 'bg-red-500/20 text-red-400',
      health: 'bg-purple-500/20 text-purple-400',
      education: 'bg-yellow-500/20 text-yellow-400',
      entertainment: 'bg-pink-500/20 text-pink-400',
      other: 'bg-gray-500/20 text-gray-400'
    }
    return colors[category] || colors.other
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Daily Expenses</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Expense
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {['week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading expenses...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              {summary && (
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Summary ({period.charAt(0).toUpperCase() + period.slice(1)})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-600/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Spend</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(summary.totalSpend)}</p>
                    </div>
                    <div className="bg-gray-600/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Savings</p>
                      <p className="text-xl font-bold text-green-400">{formatCurrency(summary.totalSavings)}</p>
                    </div>
                    <div className="bg-gray-600/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Average Daily</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(summary.averageDaily)}</p>
                    </div>
                    <div className="bg-gray-600/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Expense Count</p>
                      <p className="text-xl font-bold text-white">{summary.expenseCount}</p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Category Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Object.entries(summary.categoryBreakdown).map(([category, amount]) => (
                        <div key={category} className={`rounded-lg p-3 ${getCategoryColor(category)}`}>
                          <p className="text-sm font-medium capitalize">{category}</p>
                          <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Expenses List */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Expenses</h3>
                
                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense._id} className="bg-gray-600/30 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-medium">{formatDate(expense.date)}</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense._id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-2">
                              {['food', 'transport', 'bills', 'health', 'education', 'entertainment', 'other'].map((category) => (
                                expense[category] > 0 && (
                                  <div key={category} className={`rounded px-2 py-1 text-xs ${getCategoryColor(category)}`}>
                                    <span className="capitalize">{category}: {formatCurrency(expense[category])}</span>
                                  </div>
                                )
                              ))}
                            </div>
                            
                            {expense.notes && (
                              <p className="text-gray-400 text-sm">{expense.notes}</p>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-white">{formatCurrency(expense.totalSpend)}</p>
                            {expense.savings > 0 && (
                              <p className="text-green-400 text-sm">+{formatCurrency(expense.savings)} saved</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">No Expenses Yet</h3>
                    <p className="text-gray-400 mb-4">Start tracking your daily expenses to see insights and summaries.</p>
                    <button
                      onClick={handleAddExpense}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Add Your First Expense
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      <DailyExpenseForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleFormSave}
        expenseData={editingExpense}
      />
    </>
  )
}