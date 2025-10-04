'use client'

import { useState, useEffect } from 'react'

export default function DailyExpenseForm({ isOpen, onClose, onSave, expenseData }) {
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
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Populate form if editing existing expense
  useEffect(() => {
    if (expenseData) {
      setFormData({
        date: new Date(expenseData.date).toISOString().split('T')[0],
        food: expenseData.food || 0,
        transport: expenseData.transport || 0,
        bills: expenseData.bills || 0,
        health: expenseData.health || 0,
        education: expenseData.education || 0,
        entertainment: expenseData.entertainment || 0,
        other: expenseData.other || 0,
        savings: expenseData.savings || 0,
        notes: expenseData.notes || ''
      })
    } else {
      // Reset form for new expense
      setFormData({
        date: new Date().toISOString().split('T')[0],
        food: 0,
        transport: 0,
        bills: 0,
        health: 0,
        education: 0,
        entertainment: 0,
        other: 0,
        savings: 0,
        notes: ''
      })
    }
  }, [expenseData, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : parseFloat(value) || 0
    }))
  }

  const calculateTotal = () => {
    return formData.food + formData.transport + formData.bills + 
           formData.health + formData.education + formData.entertainment + formData.other
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const url = expenseData 
        ? `http://localhost:5000/api/daily-expenses/${expenseData._id}`
        : 'http://localhost:5000/api/daily-expenses'
      
      const method = expenseData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data.expense)
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save expense')
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const totalSpend = calculateTotal()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {expenseData ? 'Edit Expense' : 'Add Daily Expense'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          {/* Expense Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Expense Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'food', label: 'Food & Dining', icon: '🍔' },
                { name: 'transport', label: 'Transport', icon: '🚗' },
                { name: 'bills', label: 'Bills & Utilities', icon: '💡' },
                { name: 'health', label: 'Healthcare', icon: '🏥' },
                { name: 'education', label: 'Education', icon: '📚' },
                { name: 'entertainment', label: 'Entertainment', icon: '🎬' },
                { name: 'other', label: 'Other', icon: '📦' }
              ].map((category) => (
                <div key={category.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {category.icon} {category.label}
                  </label>
                  <input
                    type="number"
                    name={category.name}
                    value={formData[category.name]}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Savings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              💰 Savings (Optional)
            </label>
            <input
              type="number"
              name="savings"
              value={formData.savings}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white resize-none"
              placeholder="Add any notes about this expense..."
            />
          </div>

          {/* Total Summary */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white">Total Spend:</span>
              <span className="text-2xl font-bold text-blue-400">
                ₹{totalSpend.toFixed(2)}
              </span>
            </div>
            {formData.savings > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-500/30">
                <span className="text-sm text-gray-300">Savings:</span>
                <span className="text-lg font-semibold text-green-400">
                  +₹{formData.savings.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (expenseData ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
