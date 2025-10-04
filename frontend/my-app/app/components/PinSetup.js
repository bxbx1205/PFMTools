'use client'

import { useState } from 'react'

export default function PinSetup({ onPinSet, onClose }) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/auth/set-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin })
      })

      const data = await response.json()

      if (response.ok) {
        const email = localStorage.getItem('lastEmail')
        localStorage.setItem(`pinEnabled_${email}`, 'true')
        onPinSet()
      } else {
        setError(data.message || 'Failed to set PIN')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        margin: '1rem'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Set up 4-digit PIN
        </h2>

        <p style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Create a 4-digit PIN for quick and secure login
        </p>

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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Enter PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Confirm PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
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

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
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
              {loading ? 'Setting up...' : 'Set PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}