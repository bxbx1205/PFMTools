'use client'

import { useState } from 'react'

export default function EmailModal({ isOpen, onClose, onSendEmail, userName }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic email validation
    if (!email) {
      setMessage('Please enter your email address')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/email/weekly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        if (data.networkFallback) {
          setMessage('⚠️ Weekly report generated! Network issue prevented email delivery - check backend console for full report')
        } else if (data.simulation) {
          setMessage('✅ Weekly report generated successfully! (Check backend console for simulated email)')
        } else {
          setMessage('✅ Weekly report sent successfully to your email!')
        }
        setTimeout(() => {
          onClose()
          setEmail('')
          setMessage('')
        }, 4000)
      } else {
        setMessage(`❌ ${data.message || 'Failed to send email'}`)
      }
    } catch (error) {
      console.error('Email send error:', error)
      setMessage('❌ Failed to send email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setEmail('')
      setMessage('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Send Weekly Report</h3>
                <p className="text-sm text-slate-400">Get your expense insights via email</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-2">📊 What you'll receive:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Weekly expense breakdown by category</li>
                <li>• AI-powered spending predictions for next week</li>
                <li>• Personalized financial insights and tips</li>
                <li>• Beautiful visual charts and summaries</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  message.includes('✅') 
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/20 border border-red-500/30 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-xs text-slate-500 text-center">
              Your email will be used only to send this report and won't be stored.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}