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

  const PinInput = ({ value, onChange, disabled, placeholder }) => {
    const handlePinChange = (e) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 4)
      onChange({ target: { name: 'pin', value: val } })
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Security PIN
        </label>
        <input
          type="password"
          name="pin"
          value={value}
          onChange={handlePinChange}
          placeholder={placeholder || "Enter 4-digit PIN"}
          disabled={disabled}
          maxLength="4"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-center text-2xl tracking-widest"
          style={{ letterSpacing: '0.5em' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Webkit browsers (Chrome, Safari, newer Edge) */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.4);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          border: 2px solid rgba(30, 41, 59, 0.4);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #1e40af);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        ::-webkit-scrollbar-corner {
          background: rgba(30, 41, 59, 0.4);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 rgba(30, 41, 59, 0.4);
        }
        
        /* Smooth scrolling for all elements */
        * {
          scroll-behavior: smooth;
        }
        
        /* Enhanced hover effects for scrollable content */
        .scrollable-area:hover::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #2563eb, #1e40af);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }
      `}</style>
      
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">PF</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Personal Finance Manager
          </h1>
          <p className="text-gray-400">
            {isLogin 
              ? (isPinLogin ? 'Enter your PIN to continue' : 'Welcome back! Sign in to continue') 
              : 'Create your account to get started'
            }
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex bg-gray-800/30 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setIsPinLogin(false); toggleMode() }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin && !isPinLogin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={toggleMode}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* PIN/Password Toggle for Login */}
          {isLogin && savedEmail && (
            <div className="flex bg-gray-800/30 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={switchToPasswordLogin}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isPinLogin
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={switchToPinLogin}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isPinLogin
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                PIN
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={loading || (isLogin && savedEmail)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            {(!isPinLogin) && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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

            {/* PIN Field */}
            {isPinLogin && (
              <PinInput
                value={formData.pin}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your 4-digit PIN"
              />
            )}

            {/* Remember Me Checkbox */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? (isPinLogin ? 'Verifying PIN...' : 'Signing In...') : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? (isPinLogin ? 'Verify PIN' : 'Sign In') : 'Create Account'
              )}
            </button>

            {/* Alternative Actions */}
            <div className="text-center space-y-3">
              {/* Switch between Sign In and Sign Up */}
              <p className="text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>

              {/* Social Login Options */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="px-4 text-gray-400 text-sm">Or continue with</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2025 Personal Finance Manager. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Help</button>
          </div>
        </div>
      </div>
    </div>
  )
}