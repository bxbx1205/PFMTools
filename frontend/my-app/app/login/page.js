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
  const [savedEmail, setSavedEmail] = useState('')
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

    try {
      let endpoint = '/api/auth/login'
      let body = { email: formData.email, password: formData.password }

      if (isPinLogin) {
        endpoint = '/api/auth/login-pin'
        body = { email: formData.email, pin: formData.pin }
      } else if (!isLogin) {
        endpoint = '/api/auth/signup'
        body = { name: formData.name, email: formData.email, password: formData.password }
      }

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
        router.push('/dashboard')
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          {isPinLogin ? 'PIN Login' : (isLogin ? 'Login' : 'Sign Up')}
        </h1>

        {savedEmail && !isPinLogin && isLogin && (
          <div style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            Welcome back! You can use your PIN for quick login.
            <button
              onClick={switchToPinLogin}
              style={{
                color: '#0369a1',
                textDecoration: 'underline',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              Use PIN
            </button>
          </div>
        )}

        {isPinLogin && (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            Quick login with your 4-digit PIN
            <button
              onClick={switchToFullLogin}
              style={{
                color: '#3b82f6',
                textDecoration: 'underline',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              Use password instead
            </button>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && !isPinLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin && !isPinLogin}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={isPinLogin && savedEmail}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: (isPinLogin && savedEmail) ? '#f9fafb' : 'white'
              }}
            />
          </div>

          {isPinLogin ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                PIN (4 digits)
              </label>
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                required
                maxLength={4}
                pattern="\d{4}"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                  boxSizing: 'border-box'
                }}
                placeholder="••••"
              />
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Please wait...' : (
              isPinLogin ? 'Login with PIN' : (isLogin ? 'Login' : 'Sign Up')
            )}
          </button>
        </form>

        {!isPinLogin && (
          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setFormData({ email: formData.email, password: '', name: '', pin: '' })
                setError('')
              }}
              style={{
                color: '#3b82f6',
                textDecoration: 'underline',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}