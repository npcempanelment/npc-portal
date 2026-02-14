/**
 * Admin page — issue empanelment letters and engagement orders (placeholder).
 */

import React from 'react';

export default function AdminLettersPage() {
  return (
    <div style={styles.container}>
      <h2>Issue Letters &amp; Orders</h2>
      <p style={styles.subtitle}>
        Generate empanelment letters and engagement orders after DG approval.
      </p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Empanelment Letters</h3>
          <p style={styles.cardDesc}>
            After Empanelment Committee recommendation and DG approval, generate formal empanelment letters
            with unique empanelment number, 3-year validity, and assigned category/domain.
          </p>
          <span style={styles.ref}>AI §6.1</span>
          <span style={styles.coming}>Coming Soon</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Engagement Orders</h3>
          <p style={styles.cardDesc}>
            After Selection Committee recommendation and DG approval, issue engagement orders with
            designation, remuneration, contract period, place of deployment, and terms.
          </p>
          <span style={styles.ref}>AI-858 §7</span>
          <span style={styles.coming}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },
  cardTitle: { margin: '0 0 8px', fontSize: '1rem' },
  cardDesc: { margin: '0 0 12px', fontSize: '0.85rem', color: '#555' },
  ref: {
    display: 'inline-block', padding: '2px 8px', background: '#e8eaf6',
    color: '#1a237e', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, marginRight: 8,
  },
  coming: {
    display: 'inline-block', padding: '3px 10px', background: '#fff3e0',
    color: '#e65100', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
  },
};
