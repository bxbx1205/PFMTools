'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const router = useRouter()

  // Form state for adding/editing loans
  const [loanForm, setLoanForm] = useState({
    creditorName: '',
    debtType: '',
    currentBalance: '',
    minimumPayment: '',
    interestRate: '',
    dueDate: ''
  })

  useEffect(() => {
    checkAuth()
    loadLoans()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    return true
  }

  const loadLoans = async () => {
    if (!checkAuth()) return

    console.log('Loading loans...') // Debug log

    try {
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token) // Debug log
      
      const response = await fetch('http://localhost:5000/api/debts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('Load loans response status:', response.status) // Debug log

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded loans data:', data) // Debug log
        setLoans(data.debts || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to load loans:', errorData)
      }
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLoanForm({
      creditorName: '',
      debtType: '',
      currentBalance: '',
      minimumPayment: '',
      interestRate: '',
      dueDate: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!checkAuth()) return

    console.log('Submitting loan form:', loanForm) // Debug log

    try {
      const token = localStorage.getItem('token')
      const url = editingLoan 
        ? `http://localhost:5000/api/debts/${editingLoan._id}`
        : 'http://localhost:5000/api/debts'
      
      const method = editingLoan ? 'PUT' : 'POST'

      const requestBody = {
        ...loanForm,
        currentBalance: parseFloat(loanForm.currentBalance) || 0,
        minimumPayment: parseFloat(loanForm.minimumPayment) || 0,
        interestRate: parseFloat(loanForm.interestRate) || 0
      }

      console.log('Request URL:', url) // Debug log
      console.log('Request method:', method) // Debug log
      console.log('Request body:', requestBody) // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status) // Debug log
      
      const responseData = await response.json()
      console.log('Response data:', responseData) // Debug log

      if (response.ok) {
        console.log('Loan saved successfully!') // Debug log
        await loadLoans()
        setShowAddModal(false)
        setEditingLoan(null)
        resetForm()
      } else {
        console.error('Failed to save loan:', responseData)
        alert(`Failed to save loan: ${responseData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving loan:', error)
      alert(`Error saving loan: ${error.message}`)
    }
  }

  const handleEdit = (loan) => {
    setEditingLoan(loan)
    setLoanForm({
      creditorName: loan.creditorName || '',
      debtType: loan.debtType || '',
      currentBalance: loan.currentBalance?.toString() || '',
      minimumPayment: loan.minimumPayment?.toString() || '',
      interestRate: loan.interestRate?.toString() || '',
      dueDate: loan.dueDate || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (loanId) => {
    if (!checkAuth()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/debts/${loanId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        await loadLoans()
        setShowDeleteModal(null)
      } else {
        console.error('Failed to delete loan')
      }
    } catch (error) {
      console.error('Error deleting loan:', error)
    }
  }

  const calculateTotalDebt = () => {
    return loans.reduce((total, loan) => total + (loan.currentBalance || 0), 0)
  }

  const calculateTotalMinPayments = () => {
    return loans.reduce((total, loan) => total + (loan.minimumPayment || 0), 0)
  }

  const calculateAverageInterest = () => {
    if (loans.length === 0) return 0
    const totalInterest = loans.reduce((total, loan) => total + (loan.interestRate || 0), 0)
    return totalInterest / loans.length
  }

  const getDebtTypeColor = (type) => {
    const colors = {
      'Credit Card': 'bg-red-500',
      'Personal Loan': 'bg-blue-500',
      'Home Loan': 'bg-green-500',
      'Car Loan': 'bg-purple-500',
      'Student Loan': 'bg-yellow-500',
      'Business Loan': 'bg-indigo-500',
      'Other': 'bg-gray-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading loans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Loan Management
            </h1>
            <p className="text-gray-300 mt-2">Manage your loans and debts efficiently</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Total Loans</h3>
            <p className="text-2xl font-bold text-emerald-400">{loans.length}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Total Debt</h3>
            <p className="text-2xl font-bold text-red-400">₹{calculateTotalDebt().toLocaleString()}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Monthly Payments</h3>
            <p className="text-2xl font-bold text-blue-400">₹{calculateTotalMinPayments().toLocaleString()}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Avg Interest Rate</h3>
            <p className="text-2xl font-bold text-yellow-400">{calculateAverageInterest().toFixed(1)}%</p>
          </div>
        </div>

        {/* Add Loan Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Loans</h2>
          <button
            onClick={() => {
              resetForm()
              setEditingLoan(null)
              setShowAddModal(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors"
          >
            + Add New Loan
          </button>
        </div>

        {/* Loans List */}
        {loans.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">No loans yet</h3>
            <p className="text-gray-400 mb-6">Add your first loan to start tracking your debt</p>
            <button
              onClick={() => {
                resetForm()
                setEditingLoan(null)
                setShowAddModal(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors"
            >
              Add Your First Loan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <div key={loan._id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{loan.creditorName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-3 h-3 rounded-full ${getDebtTypeColor(loan.debtType)}`}></span>
                      <span className="text-sm text-gray-300">{loan.debtType}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(loan)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(loan._id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <span className="text-red-400 font-semibold">₹{(loan.currentBalance || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Payment:</span>
                    <span className="text-blue-400">₹{(loan.minimumPayment || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interest Rate:</span>
                    <span className="text-yellow-400">{loan.interestRate || 0}%</span>
                  </div>
                  
                  {loan.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Due Date:</span>
                      <span className="text-gray-300">{loan.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Loan Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-semibold mb-4">
                {editingLoan ? 'Edit Loan' : 'Add New Loan'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Creditor/Lender Name
                  </label>
                  <input
                    type="text"
                    value={loanForm.creditorName}
                    onChange={(e) => setLoanForm({...loanForm, creditorName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., HDFC Bank, SBI, ICICI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Loan Type
                  </label>
                  <select
                    value={loanForm.debtType}
                    onChange={(e) => setLoanForm({...loanForm, debtType: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Select loan type</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Student Loan">Student Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={loanForm.currentBalance}
                    onChange={(e) => setLoanForm({...loanForm, currentBalance: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Outstanding amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Minimum Monthly Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={loanForm.minimumPayment}
                    onChange={(e) => setLoanForm({...loanForm, minimumPayment: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Monthly EMI"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({...loanForm, interestRate: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Annual interest rate"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Due Date (optional)
                  </label>
                  <input
                    type="text"
                    value={loanForm.dueDate}
                    onChange={(e) => setLoanForm({...loanForm, dueDate: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., 15th of every month"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingLoan(null)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors"
                  >
                    {editingLoan ? 'Update' : 'Add'} Loan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Delete Loan</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this loan? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}