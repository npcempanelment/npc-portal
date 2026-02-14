/**
 * Site header with NPC branding and navigation.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <img src="/logo.png" alt="NPC" style={styles.logo} />
        <div>
          <h1 style={styles.title}>National Productivity Council</h1>
          <p style={styles.subtitle}>
            Under DPIIT, Ministry of Commerce & Industry, Government of India
          </p>
        </div>
      </div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Home</Link>
        {!user && <Link to="/login" style={styles.link}>Login</Link>}
        {!user && <Link to="/register" style={styles.link}>Register</Link>}
        {user && <Link to="/dashboard" style={styles.link}>Dashboard</Link>}
        {user?.roles.includes('ADMIN') && <Link to="/admin" style={styles.link}>Admin</Link>}
        {(user?.roles.includes('SCREENING_MEMBER') || user?.roles.includes('EMPANELMENT_MEMBER')) && (
          <Link to="/committee" style={styles.link}>Committee</Link>
        )}
        {user && (
          <button onClick={logout} style={styles.logoutBtn}>
            Logout ({user.name})
          </button>
        )}
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: '#1a237e',
    color: '#fff',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  brand: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { width: 48, height: 48, borderRadius: '50%', objectFit: 'contain' as const, background: '#fff', padding: 2 },
  title: { margin: 0, fontSize: '1.3rem' },
  subtitle: { margin: 0, fontSize: '0.75rem', opacity: 0.85 },
  nav: { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '0.9rem' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
