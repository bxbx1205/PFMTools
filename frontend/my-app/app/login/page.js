'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isPinLogin, setIsPinLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    pin: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has PIN enabled for this email
    const lastEmail = localStorage.getItem('lastEmail')
    const hasPinEnabled = localStorage.getItem(`pinEnabled_${lastEmail}`) === 'true'
    
    if (lastEmail && hasPinEnabled) {
      setSavedEmail(lastEmail)
      setFormData(prev => ({ ...prev, email: lastEmail }))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      if (!formData.email || (!formData.password && !isPinLogin) || (!formData.pin && isPinLogin)) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (!isLogin && !formData.name) {
        setError('Please enter your full name')
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Validate password strength for signup
      if (!isLogin && !isPinLogin && formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      // Validate PIN format
      if (isPinLogin && (!/^\d{4}$/.test(formData.pin))) {
        setError('PIN must be exactly 4 digits')
        setLoading(false)
        return
      }

      // Handle login flows
      if (isLogin || isPinLogin) {
        let endpoint = '/api/auth/login'
        let body = { email: formData.email, password: formData.password }

        if (isPinLogin) {
          endpoint = '/api/auth/login-pin'
          body = { email: formData.email, pin: formData.pin }
        }

        try {
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          const data = await response.json()

          if (response.ok) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('lastEmail', data.user.email)
            localStorage.setItem(`pinEnabled_${data.user.email}`, data.user.pinEnabled.toString())
            localStorage.setItem('userName', data.user.name)
            
            if (rememberMe) {
              localStorage.setItem('rememberUser', 'true')
            }
            
            setSuccess(isPinLogin ? 'PIN verified! Redirecting...' : 'Welcome back! Redirecting to dashboard...')
            setTimeout(() => {
              router.push('/dashboard')
            }, 1500)
          } else {
            setError(data.message || 'Login failed')
          }
        } catch (error) {
          setError('Network error. Please check your connection.')
        }
      } 
      // Handle signup
      else {
        try {
          const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('lastEmail', data.user.email)
            localStorage.setItem(`pinEnabled_${data.user.email}`, data.user.pinEnabled.toString())
            localStorage.setItem('userName', data.user.name)
            
            setSuccess('Account created successfully! Redirecting to dashboard...')
            setTimeout(() => {
              router.push('/dashboard')
            }, 1500)
          } else {
            setError(data.message || 'Signup failed')
          }
        } catch (error) {
          setError('Network error. Please check your connection.')
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const switchToPinLogin = () => {
    setIsPinLogin(true)
    setIsLogin(true)
    setError('')
    setSuccess('')
    setFormData(prev => ({ ...prev, password: '', pin: '' }))
  }

  const switchToPasswordLogin = () => {
    setIsPinLogin(false)
    setIsLogin(true)
    setError('')
    setSuccess('')
    setFormData(prev => ({ ...prev, password: '', pin: '' }))
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setIsPinLogin(false)
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      name: '',
      pin: ''
    })
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
              {isLogin 
                ? (isPinLogin ? 'Enter your secure PIN to continue' : 'Welcome back! Sign in to your financial command center') 
                : 'Create your account and start building wealth'
              }
            </p>
          </div>

          {/* Enhanced Main Form Card */}
          <div className="glass-morphism rounded-3xl p-8 card-hover">
            {/* Enhanced Tab Switcher */}
            <div className="flex bg-slate-800/30 rounded-2xl p-1.5 mb-8">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setIsPinLogin(false); toggleMode() }}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isLogin && !isPinLogin
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={toggleMode}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Enhanced PIN/Password Toggle for Login */}
            {isLogin && savedEmail && (
              <div className="flex bg-slate-800/30 rounded-2xl p-1.5 mb-8">
                <button
                  type="button"
                  onClick={switchToPasswordLogin}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                    !isPinLogin
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={switchToPinLogin}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isPinLogin
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  PIN
                </button>
              </div>
            )}

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Signup only) */}
              {!isLogin && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 font-medium transition-all duration-300 input-field"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={loading || (isLogin && savedEmail)}
                  className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 font-medium transition-all duration-300 input-field disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              {(!isPinLogin) && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isLogin ? "Enter your password" : "Create a secure password (min 6 characters)"}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 font-medium transition-all duration-300 input-field pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-300 p-2 hover:bg-slate-700/30 rounded-xl"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced PIN Field */}
              {isPinLogin && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-400 tracking-wide uppercase">
                    Security PIN
                  </label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                      handleInputChange({ target: { name: 'pin', value: val } })
                    }}
                    placeholder="Enter 4-digit PIN"
                    disabled={loading}
                    maxLength="4"
                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-600/50 rounded-2xl focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 text-white placeholder-slate-400 text-center text-3xl tracking-widest font-bold transition-all duration-300 input-field"
                  />
                </div>
              )}

              {/* Enhanced Remember Me Checkbox */}
              {isLogin && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 text-violet-600 bg-slate-800/50 border-slate-600 rounded-lg focus:ring-violet-500 focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="ml-3 text-sm text-slate-300 font-medium">
                      Remember me for 30 days
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors duration-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-violet-500/25 mt-8"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="font-bold">
                      {isLogin ? (isPinLogin ? 'Verifying PIN...' : 'Signing In...') : 'Creating Account...'}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-black">
                    {isLogin ? (isPinLogin ? 'Verify PIN' : 'Sign In') : 'Create Account'}
                  </span>
                )}
              </button>

              {/* Enhanced Alternative Actions */}
              <div className="text-center space-y-6 pt-6">
                {/* Switch between Sign In and Sign Up */}
                <p className="text-slate-400 font-medium">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-violet-400 hover:text-violet-300 font-bold transition-colors duration-300"
                  >
                    {isLogin ? 'Sign up here' : 'Sign in here'}
                  </button>
                </p>

                {/* Enhanced Social Login Options */}
                <div className="flex items-center my-8">
                  <div className="flex-1 border-t border-slate-600/50"></div>
                  <span className="px-6 text-slate-400 text-sm font-medium uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 border-t border-slate-600/50"></div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="flex-1 bg-slate-800/30 hover:bg-slate-700/30 border border-slate-600/50 text-white py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center font-medium hover:scale-105 hover:border-slate-500"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-slate-800/30 hover:bg-slate-700/30 border border-slate-600/50 text-white py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center font-medium hover:scale-105 hover:border-slate-500"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
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