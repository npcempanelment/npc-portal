/**
 * Applicant dashboard — profile, applications, links.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <p style={{ padding: '24px' }}>Please log in.</p>;

  return (
    <div style={styles.container}>
      <h2>Welcome, {user.name}</h2>
      <p style={{ color: '#666' }}>Role(s): {user.roles.join(', ')}</p>

      <div style={styles.grid}>
        <DashCard title="My Profile" description="View and update your personal details, education, and experience." linkTo="/profile" />
        <DashCard title="Apply for Empanelment" description="Apply as an external expert or associate in your domain." linkTo="/apply/empanelment" />
        <DashCard title="Apply against Advertisement" description="Browse open advertisements and apply for contractual positions." linkTo="/adverts" />
        <DashCard title="My Applications" description="Track the status of your empanelment and contractual applications." linkTo="/my-applications" />
      </div>
    </div>
  );
}

function DashCard({ title, description, linkTo }: { title: string; description: string; linkTo: string }) {
  return (
    <Link to={linkTo} style={styles.card}>
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{description}</p>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' },
  card: {
    display: 'block',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    textDecoration: 'none',
    color: '#333',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s',
  },
};
