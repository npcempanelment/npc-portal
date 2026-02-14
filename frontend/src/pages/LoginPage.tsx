/**
 * Login page.
 */

import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
        </label>
        <label style={styles.label}>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        </label>
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', justifyContent: 'center', padding: '48px 24px' },
  form: { width: '100%', maxWidth: '400px', background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label: { display: 'block', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 500 },
  input: { display: 'block', width: '100%', padding: '8px 12px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '10px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  error: { background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', fontSize: '0.9rem' },
};
