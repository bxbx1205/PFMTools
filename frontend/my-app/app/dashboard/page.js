'use client'

import { useRouter } from 'next/navigation'
import ProtectedRoute from '../components/ProtectedRoute'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <main style={{minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'}}>
        <header style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{margin: 0, fontSize: '1.75rem'}}>Dashboard</h1>
            <p style={{marginTop: '.25rem', color: '#555'}}>Overview and recent activity</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </header>

      <section style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
        <div style={{background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize: '0.75rem', color: '#666'}}>Users</div>
          <div style={{fontSize: '1.5rem', fontWeight: 600}}>1,234</div>
          <div style={{fontSize: '0.85rem', color: '#1a7f37', marginTop: '.5rem'}}>+3.4% vs last week</div>
        </div>

        <div style={{background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize: '0.75rem', color: '#666'}}>Active Projects</div>
          <div style={{fontSize: '1.5rem', fontWeight: 600}}>18</div>
          <div style={{fontSize: '0.85rem', color: '#b36b00', marginTop: '.5rem'}}>−1 vs last week</div>
        </div>

        <div style={{background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize: '0.75rem', color: '#666'}}>Errors</div>
          <div style={{fontSize: '1.5rem', fontWeight: 600}}>3</div>
          <div style={{fontSize: '0.85rem', color: '#c42b2b', marginTop: '.5rem'}}>Last 24 hours</div>
        </div>
      </section>

      <section>
        <h2 style={{fontSize: '1.125rem', margin: '0 0 .75rem 0'}}>Recent activity</h2>
        <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem'}}>
          <li style={{background: '#fff', padding: '.75rem 1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize: '.9rem'}}>Deployed project <strong>marketing-site</strong></div>
            <div style={{fontSize: '.8rem', color: '#666'}}>10 minutes ago</div>
          </li>
          <li style={{background: '#fff', padding: '.75rem 1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize: '.9rem'}}>User <strong>alice@example.com</strong> signed up</div>
            <div style={{fontSize: '.8rem', color: '#666'}}>2 hours ago</div>
          </li>
          <li style={{background: '#fff', padding: '.75rem 1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize: '.9rem'}}>Database backup completed</div>
            <div style={{fontSize: '.8rem', color: '#666'}}>Yesterday</div>
          </li>
        </ul>
      </section>
    </main>
    </ProtectedRoute>
  )
}
