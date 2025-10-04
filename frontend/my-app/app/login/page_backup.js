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
            
            setSuccess('Welcome back! Redirecting to dashboard...')
            await new Promise(resolve => setTimeout(resolve, 1500))
            router.push('/dashboard')
          } else {
            setError(data.message || 'Invalid credentials. Please try again.')
          }
        } catch (networkError) {
          // Fallback for testing without backend
          console.log('Backend not available, using client-side simulation')
          
          // Check if this email has been used for signup before
          const storedUserData = localStorage.getItem('userData')
          if (storedUserData) {
            const userData = JSON.parse(storedUserData)
            if (userData.email === formData.email) {
              localStorage.setItem('token', 'demo-token-' + Date.now())
              localStorage.setItem('lastEmail', formData.email)
              localStorage.setItem('userName', userData.name)
              
              if (rememberMe) {
                localStorage.setItem('rememberUser', 'true')
              }
              
              setSuccess('Welcome back! Redirecting to dashboard...')
              await new Promise(resolve => setTimeout(resolve, 1500))
              router.push('/dashboard')
              return
            }
          }
          
          // If no matching user found
          setError('User not found. Please sign up first.')
        }
      } 
      // Handle signup flow
      else {
        // Check if email already exists in localStorage (for demo purposes)
        const existingUserData = localStorage.getItem('userData')
        if (existingUserData) {
          const userData = JSON.parse(existingUserData)
          if (userData.email === formData.email) {
            setError('Email already exists. Please use a different email or try logging in.')
            setLoading(false)
            return
          }
        }
        
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          signupDate: new Date().toISOString()
        }

        try {
          const response = await fetch(`http://localhost:5000/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData),
          })

          const data = await response.json()

          if (response.ok) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('lastEmail', data.user.email)
            localStorage.setItem(`pinEnabled_${data.user.email}`, data.user.pinEnabled.toString())
            localStorage.setItem('userName', data.user.name)
            localStorage.setItem('isFirstTimeUser', 'true')
            
            if (rememberMe) {
              localStorage.setItem('rememberUser', 'true')
            }
            
            setSuccess('Account created successfully! Welcome to PFM Tools! 🎉')
            await new Promise(resolve => setTimeout(resolve, 2000))
            router.push('/dashboard')
          } else {
            setError(data.message || 'Something went wrong. Please try again.')
          }
        } catch (networkError) {
          // Fallback for testing without backend
          console.log('Backend not available, using client-side simulation')
          
          localStorage.setItem('token', 'demo-token-' + Date.now())
          localStorage.setItem('lastEmail', formData.email)
          localStorage.setItem('pinEnabled_' + formData.email, 'false')
          localStorage.setItem('userName', formData.name)
          localStorage.setItem('userData', JSON.stringify(signupData))
          localStorage.setItem('isFirstTimeUser', 'true')
          
          if (rememberMe) {
            localStorage.setItem('rememberUser', 'true')
          }
          
          setSuccess('Account created successfully! Welcome to PFM Tools! 🎉')
          await new Promise(resolve => setTimeout(resolve, 2000))
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (error) {
      setError('')
    }
  }

  const switchToFullLogin = () => {
    setIsPinLogin(false)
    setFormData(prev => ({ ...prev, pin: '', password: '' }))
    setError('')
  }

  const switchToPinLogin = () => {
    setIsPinLogin(true)
    setFormData(prev => ({ ...prev, password: '', pin: '' }))
    setError('')
  }

  const switchToSignup = () => {
    setIsLogin(false)
    setIsPinLogin(false)
    setFormData({ email: formData.email, password: '', name: '', pin: '' })
    setError('')
    setSuccess('')
  }

  const switchToLogin = () => {
    setIsLogin(true)
    setIsPinLogin(false)
    setFormData({ email: formData.email, password: '', name: '', pin: '' })
    setError('')
    setSuccess('')
  }

  const handleForgotPassword = () => {
    setError('')
    setSuccess('Password reset link will be sent to your email address.')
    // TODO: Implement actual forgot password functionality
  }

  return (
    <>
      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 30%, #0f1419 70%, #0a0e1a 100%);
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 25% 30%, rgba(0, 200, 150, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 75% 20%, rgba(0, 184, 124, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
          pointer-events: none;
        }

        .login-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><pattern id="grain" width="200" height="200" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.03"/><circle cx="150" cy="150" r="0.3" fill="white" opacity="0.02"/><circle cx="100" cy="25" r="0.4" fill="white" opacity="0.025"/></pattern></defs><rect width="200" height="200" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .floating-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
          animation: float 12s ease-in-out infinite;
          filter: blur(1px);
        }

        // asjkdfsf

        .orb:nth-child(1) {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, rgba(0, 200, 150, 0.15), rgba(0, 184, 124, 0.08));
          top: 15%;
          left: 8%;
          animation-delay: 0s;
        }

        .orb:nth-child(2) {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(59, 130, 246, 0.06));
          top: 65%;
          right: 12%;
          animation-delay: 4s;
        }

        .orb:nth-child(3) {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05));
          top: 25%;
          right: 20%;
          animation-delay: 8s;
        }

        .orb:nth-child(4) {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(0, 200, 150, 0.08), rgba(34, 197, 94, 0.04));
          top: 80%;
          left: 25%;
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.05) rotate(90deg);
          }
          50% {
            transform: translateY(-40px) translateX(-5px) scale(1.1) rotate(180deg);
          }
          75% {
            transform: translateY(-20px) translateX(-10px) scale(1.05) rotate(270deg);
          }
        }

        .login-wrapper {
          width: 100%;
          max-width: 600px;
          position: relative;
          z-index: 2;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #00C896 0%, #00B87C 100%);
          border-radius: 18px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 
            0 10px 40px rgba(0, 200, 150, 0.4),
            0 0 80px rgba(0, 200, 150, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(0, 200, 150, 0.4);
          transition: all 0.3s ease;
          animation: logoGlow 3s ease-in-out infinite;
        }

        .logo:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 15px 50px rgba(0, 200, 150, 0.5),
            0 0 100px rgba(0, 200, 150, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        @keyframes logoGlow {
          0%, 100% {
            box-shadow: 
              0 10px 40px rgba(0, 200, 150, 0.4),
              0 0 80px rgba(0, 200, 150, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
          }
          50% {
            box-shadow: 
              0 12px 45px rgba(0, 200, 150, 0.5),
              0 0 90px rgba(0, 200, 150, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo::before {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 8px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
        }

        .logo::after {
          content: '📈';
          position: absolute;
          font-size: 16px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .app-title {
          font-size: 1.875rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.375rem;
          letter-spacing: -0.025em;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .app-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00C896, transparent);
          border-radius: 1px;
        }

        .app-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 400;
          margin-bottom: 0;
          opacity: 0.9;
        }

        .auth-card {
          background: rgba(20, 28, 45, 0.85);
          backdrop-filter: blur(25px);
          border-radius: 16px;
          padding: 3rem 4rem;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 12px 40px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          position: relative;
          overflow: hidden;
          height: fit-content;
          max-height: calc(100vh - 4rem);
          width: 100%;
          animation: cardSlideIn 0.8s ease-out 0.2s both;
        }

        .auth-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 200, 150, 0.6) 20%, rgba(0, 200, 150, 0.8) 50%, rgba(0, 200, 150, 0.6) 80%, transparent 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        .auth-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 200, 150, 0.02) 0%, transparent 50%, rgba(14, 165, 233, 0.02) 100%);
          pointer-events: none;
        }

        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .auth-header {
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 1.875rem;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          text-align: center;
          letter-spacing: -0.025em;
        }

        .auth-description {
          color: #94a3b8;
          font-size: 0.95rem;
          text-align: center;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .notification-banner {
          padding: 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border: 1px solid;
          font-weight: 500;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .notification-banner.info {
          background: rgba(14, 165, 233, 0.1);
          color: #38bdf8;
          border-color: rgba(14, 165, 233, 0.3);
        }

        .notification-banner.neutral {
          background: rgba(71, 85, 105, 0.2);
          color: #cbd5e1;
          border-color: rgba(71, 85, 105, 0.3);
        }

        .notification-banner.error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .notification-banner.success {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.3);
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #e2e8f0;
        }

        .form-input {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border: 1.5px solid rgba(71, 85, 105, 0.5);
          border-radius: 12px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          font-family: inherit;
          color: #f8fafc;
          min-height: 56px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-input:focus {
          outline: none;
          border-color: #00C896;
          box-shadow: 
            0 0 0 3px rgba(0, 200, 150, 0.1),
            0 0 20px rgba(0, 200, 150, 0.1);
          background: rgba(30, 41, 59, 0.8);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input.readonly {
          background: rgba(51, 65, 85, 0.3);
          border-color: rgba(71, 85, 105, 0.3);
          cursor: not-allowed;
          color: #94a3b8;
        }

        .pin-input {
          text-align: center;
          letter-spacing: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 1.125rem;
          transition: all 0.2s ease;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .password-toggle:hover {
          color: #94a3b8;
          background: rgba(71, 85, 105, 0.2);
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #00C896 0%, #00B87C 100%);
          color: white;
          padding: 1.25rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 20px rgba(0, 200, 150, 0.3),
            0 0 40px rgba(0, 200, 150, 0.1);
          min-height: 56px;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #00B87C 0%, #059669 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 30px rgba(0, 200, 150, 0.4),
            0 0 60px rgba(0, 200, 150, 0.2);
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:disabled {
          background: rgba(71, 85, 105, 0.5);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .switch-link {
          color: #00C896;
          text-decoration: none;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .switch-link:hover {
          color: #00B87C;
          background: rgba(0, 200, 150, 0.1);
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .quick-login-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(0, 200, 150, 0.15);
          color: #00C896;
          padding: 0.375rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(0, 200, 150, 0.25);
          justify-content: center;
        }

        .quick-login-badge::before {
          content: '⚡';
          margin-right: 0.375rem;
        }

        .banner-text {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }

        .banner-action {
          margin-top: 0.5rem;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .step {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(71, 85, 105, 0.5);
          transition: all 0.3s ease;
          position: relative;
        }

        .step.active {
          background: #00C896;
          box-shadow: 0 0 20px rgba(0, 200, 150, 0.4);
        }

        .step.completed {
          background: #00C896;
        }

        .step-connector {
          width: 30px;
          height: 2px;
          background: rgba(71, 85, 105, 0.3);
          transition: all 0.3s ease;
        }

        .step-connector.completed {
          background: #00C896;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-grid-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-full-width {
          grid-column: 1 / -1;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group.compact {
          margin-bottom: 1.5rem;
        }

        .form-select {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border: 1.5px solid rgba(71, 85, 105, 0.5);
          border-radius: 12px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          font-family: inherit;
          color: #f8fafc;
          min-height: 56px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-select:focus {
          outline: none;
          border-color: #00C896;
          box-shadow: 
            0 0 0 3px rgba(0, 200, 150, 0.1),
            0 0 20px rgba(0, 200, 150, 0.1);
          background: rgba(30, 41, 59, 0.8);
        }

        .form-select option {
          background: #1e293b;
          color: #f8fafc;
          padding: 0.5rem;
        }

        .back-button {
          background: rgba(71, 85, 105, 0.3);
          color: #cbd5e1;
          border: 1px solid rgba(71, 85, 105, 0.5);
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 1rem;
          min-height: 56px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .back-button:hover {
          background: rgba(71, 85, 105, 0.5);
          border-color: rgba(71, 85, 105, 0.7);
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .form-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 1.5rem;
          text-align: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
        }

        .optional-label {
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 400;
        }

        .section-header {
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .login-wrapper {
            max-width: 100%;
          }
          
          .auth-card {
            padding: 2.5rem 2rem;
            height: fit-content;
            max-height: calc(100vh - 2rem);
            margin: 0 1rem;
          }
          
          .form-grid,
          .form-grid-three {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 0.5rem;
          }
          
          .login-wrapper {
            max-width: 100%;
          }
          
          .auth-card {
            padding: 2rem 1.5rem;
            height: fit-content;
            max-height: calc(100vh - 1rem);
            margin: 0;
          }
          
          .app-title {
            font-size: 1.5rem;
          }
          
          .auth-title {
            font-size: 1.5rem;
          }
          
          .form-input,
          .form-select {
            padding: 0.875rem 1rem;
            min-height: 46px;
          }
          
          .submit-button,
          .back-button {
            padding: 0.875rem 1rem;
            font-size: 1rem;
            min-height: 46px;
          }
          
          .form-grid,
          .form-grid-three {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="floating-orbs">
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
        </div>
        <div className="login-wrapper">

          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">
                {isPinLogin ? 'Quick Access' : (
                  isLogin ? 'Welcome back' : (
                    signupStep === 1 ? 'Get started' :
                    signupStep === 2 ? 'Profile Information' :
                    'Debt Information'
                  )
                )}
              </h2>
              <p className="auth-description">
                {isPinLogin 
                  ? 'Enter your PIN to continue' 
                  : (isLogin 
                    ? 'Enter your details to access your account' 
                    : (
                      signupStep === 1 ? 'Create your account to start growing your wealth' :
                      signupStep === 2 ? 'Tell us about yourself to personalize your experience' :
                      'Help us understand your financial situation (optional)'
                    )
                  )
                }
              </p>
            </div>

            {savedEmail && !isPinLogin && isLogin && (
              <div className="notification-banner info">
                <div className="quick-login-badge">Quick Login Available</div>
                <div className="banner-text">
                  You can use your PIN for faster access.
                </div>
                <div className="banner-action">
                  <button onClick={switchToPinLogin} className="switch-link">
                    Use PIN instead →
                  </button>
                </div>
              </div>
            )}

            {isPinLogin && (
              <div className="notification-banner neutral">
                <div className="banner-text">
                  Quick login with your secure 4-digit PIN
                </div>
                <div className="banner-action">
                  <button onClick={switchToFullLogin} className="switch-link">
                    ← Use password instead
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="notification-banner error">
                {error}
              </div>
            )}

            {success && (
              <div className="notification-banner success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic Information (Login/Signup) */}
              {(isLogin || isPinLogin || !isLogin) && (
                <>
                  {!isLogin && !isPinLogin && (
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                        required={!isLogin && !isPinLogin}
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      required
                      readOnly={isPinLogin && savedEmail}
                      className={`form-input ${(isPinLogin && savedEmail) ? 'readonly' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>

                  {isPinLogin ? (
                    <div className="form-group">
                      <label className="form-label">PIN</label>
                      <input
                        type="password"
                        name="pin"
                        value={formData.pin}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('pin')}
                        onBlur={() => setFocusedField('')}
                        required
                        maxLength={4}
                        pattern="\d{4}"
                        className="form-input pin-input"
                        placeholder="••••"
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          required
                          className="form-input"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                          tabIndex={-1}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Profile Information */}
              {!isLogin && !isPinLogin && signupStep === 2 && (
                <>
                  <div className="form-section-title">Profile Information</div>
                  <div className="form-grid-three">
                    <div className="form-group compact">
                      <label className="form-label">Age Group</label>
                      <select
                        name="ageGroup"
                        value={profileData.ageGroup}
                        onChange={handleProfileChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select age group</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-60">46-60</option>
                        <option value="60+">60+</option>
                      </select>
                    </div>

                    <div className="form-group compact">
                      <label className="form-label">Family Size</label>
                      <input
                        type="number"
                        name="familySize"
                        value={profileData.familySize}
                        onChange={handleProfileChange}
                        required
                        min="1"
                        max="20"
                        className="form-input"
                        placeholder="Number of members"
                      />
                    </div>

                    <div className="form-group compact">
                      <label className="form-label">Daily Income (₹)</label>
                      <input
                        type="number"
                        name="dailyIncome"
                        value={profileData.dailyIncome}
                        onChange={handleProfileChange}
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                        placeholder="Average daily income"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Debt Information */}
              {!isLogin && !isPinLogin && signupStep === 3 && (
                <>
                  <div className="form-section-title">
                    Debt Information <span className="optional-label">(Optional)</span>
                  </div>
                  
                  {/* Basic Loan Information */}
                  <div className="section-header">
                    <div className="section-title">Loan Details</div>
                    <div className="section-subtitle">Basic information about your loan</div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group compact">
                      <label className="form-label">Loan Type</label>
                      <select
                        name="loanType"
                        value={debtData.loanType}
                        onChange={handleDebtChange}
                        className="form-select"
                      >
                        <option value="">Select loan type</option>
                        <option value="None">No Loan</option>
                        <option value="Personal">Personal Loan</option>
                        <option value="Home">Home Loan</option>
                        <option value="Vehicle">Vehicle Loan</option>
                        <option value="Education">Education Loan</option>
                        <option value="Business">Business Loan</option>
                        <option value="Gold">Gold Loan</option>
                      </select>
                    </div>

                    <div className="form-group compact">
                      <label className="form-label">Total Debt Amount (₹)</label>
                      <input
                        type="number"
                        name="debtAmount"
                        value={debtData.debtAmount}
                        onChange={handleDebtChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                        placeholder="Outstanding amount"
                        disabled={debtData.loanType === 'None'}
                      />
                    </div>
                  </div>

                  {/* Loan Terms & Payment Details */}
                  <div className="section-header">
                    <div className="section-title">Loan Terms & Payment</div>
                    <div className="section-subtitle">Interest rate, tenure, and monthly payment information</div>
                  </div>

                  <div className="form-grid-three">
                    <div className="form-group compact">
                      <label className="form-label">Interest Rate (%)</label>
                      <input
                        type="number"
                        name="interestRate"
                        value={debtData.interestRate}
                        onChange={handleDebtChange}
                        min="0"
                        max="50"
                        step="0.01"
                        className="form-input"
                        placeholder="Annual rate"
                        disabled={debtData.loanType === 'None'}
                      />
                    </div>

                    <div className="form-group compact">
                      <label className="form-label">Original Tenure (Months)</label>
                      <input
                        type="number"
                        name="loanTenureMonths"
                        value={debtData.loanTenureMonths}
                        onChange={handleDebtChange}
                        min="1"
                        max="360"
                        className="form-input"
                        placeholder="Total months"
                        disabled={debtData.loanType === 'None'}
                      />
                    </div>

                    <div className="form-group compact">
                      <label className="form-label">Remaining Tenure (Months)</label>
                      <input
                        type="number"
                        name="remainingTenureMonths"
                        value={debtData.remainingTenureMonths}
                        onChange={handleDebtChange}
                        min="0"
                        max={debtData.loanTenureMonths || 360}
                        className="form-input"
                        placeholder="Months left"
                        disabled={debtData.loanType === 'None'}
                      />
                    </div>
                  </div>

                  {/* Monthly Payment */}
                  <div className="section-header">
                    <div className="section-title">Monthly Payment</div>
                    <div className="section-subtitle">Your current EMI amount</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly EMI (₹)</label>
                    <input
                      type="number"
                      name="monthlyEMI"
                      value={debtData.monthlyEMI}
                      onChange={handleDebtChange}
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="EMI amount"
                      disabled={debtData.loanType === 'None'}
                    />
                  </div>
                </>
              )}

              <div className="button-group">
                {!isLogin && !isPinLogin && signupStep > 1 && (
                  <button
                    type="button"
                    onClick={goBackStep}
                    className="back-button"
                  >
                    ← Back
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                  style={{ flex: (!isLogin && !isPinLogin && signupStep > 1) ? 1 : 'auto' }}
                >
                  {loading && <span className="loading-spinner"></span>}
                  {loading ? (
                    !isLogin ? 'Creating your account...' : 'Please wait...'
                  ) : (
                    isPinLogin ? 'Continue with PIN' : (
                      isLogin ? 'Sign in' : 'Create Account 🎉'
                    )
                  )}
                </button>
              </div>
            </form>

            {!isPinLogin && (
              <div className="footer-text">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={isLogin ? switchToSignup : switchToLogin}
                  className="switch-link"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}