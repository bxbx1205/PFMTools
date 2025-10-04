'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState('enter-phone') // 'enter-phone' | 'enter-otp'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devCode, setDevCode] = useState('')
  const router = useRouter()

  const normalize = (raw) => {
    const digits = String(raw).replace(/\D/g, '')
    if (digits.length === 10) return `+91${digits}`
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
    if (raw.startsWith('+91') && /^\+91[6-9]\d{9}$/.test(raw)) return raw
    return null
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const normalized = normalize(phone)
    if (!normalized) {
      setError('Enter a valid Indian mobile number')
      return
    }
    if (!name || name.trim().length < 2) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, name })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('OTP sent successfully')
        if (data.devCode) setDevCode(data.devCode)
        setStep('enter-otp')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter 6-digit OTP')
      return
    }
    const normalized = normalize(phone)
    if (!normalized) {
      setError('Enter a valid Indian mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, code: otp, name })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('lastPhone', data.user.phone)
        localStorage.setItem('userName', data.user.name)
        setSuccess('Logged in! Redirecting...')
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setError(data.message || 'OTP verification failed')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        
        .glass-morphism {
          background: rgba(15, 15, 24, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(139, 92, 246, 0.15);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
            transform: scale(1.05);
          }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .input-field {
          transition: all 0.3s ease;
        }

        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
        }
      `}</style>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-cyan-900/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-violet-400/20 to-cyan-400/20 animate-float"
            style={{
              width: Math.random() * 6 + 3 + 'px',
              height: Math.random() * 6 + 3 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 20 + 15 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Enhanced Logo/Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl animate-pulse-glow"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-black text-white">PF</span>
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
              Personal Finance <span className="text-gradient">Manager</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg">
              Sign in with your mobile number using OTP
            </p>
          </div>

          {/* Enhanced Main Form Card */}
          <div className="glass-morphism rounded-3xl p-8 card-hover">
            {/* Phone + OTP only */}

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Success Message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-emerald-400 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Enhanced Form */}
            <form onSubmit={step === 'enter-phone' ? requestOtp : verifyOtp} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading || step === 'enter-otp'}
                  className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 font-medium transition-all duration-300 input-field"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  disabled={loading || step === 'enter-otp'}
                  className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 font-medium transition-all duration-300 input-field"
                />
              </div>

              {step === 'enter-otp' && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    disabled={loading}
                    maxLength={6}
                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 text-center text-2xl tracking-widest font-bold transition-all duration-300 input-field"
                  />
                  {devCode && (
                    <p className="text-xs text-slate-400">Dev OTP: {devCode}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-violet-500/25 mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="font-bold">{step === 'enter-phone' ? 'Sending OTP...' : 'Verifying...'}</span>
                  </div>
                ) : (
                  <span className="text-lg font-black">{step === 'enter-phone' ? 'Send OTP' : 'Verify OTP & Sign In'}</span>
                )}
              </button>

              {step === 'enter-otp' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={requestOtp}
                  className="w-full bg-slate-800/30 hover:bg-slate-700/30 border border-slate-600/50 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300"
                >
                  Resend OTP
                </button>
              )}
            </form>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-12 space-y-4">
            <p className="text-slate-400 font-medium">© 2025 Personal Finance Manager. All rights reserved.</p>
            <div className="flex justify-center space-x-6 text-sm">
              <button className="text-slate-500 hover:text-violet-400 transition-colors duration-300 font-medium">Privacy Policy</button>
              <span className="text-slate-600">•</span>
              <button className="text-slate-500 hover:text-violet-400 transition-colors duration-300 font-medium">Terms of Service</button>
              <span className="text-slate-600">•</span>
              <button className="text-slate-500 hover:text-violet-400 transition-colors duration-300 font-medium">Help Center</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}