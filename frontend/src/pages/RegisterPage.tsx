/**
 * Registration page.
 */

import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register as Applicant</h2>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>
          Full Name
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={styles.input} />
        </label>
        <label style={styles.label}>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
        </label>
        <label style={styles.label}>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        </label>
        <label style={styles.label}>
          Confirm Password
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={styles.input} />
        </label>
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
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
