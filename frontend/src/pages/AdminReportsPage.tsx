/**
 * Admin page — reports placeholder.
 */

import React from 'react';

export default function AdminReportsPage() {
  return (
    <div style={styles.container}>
      <h2>Reports &amp; Statistics</h2>
      <p style={styles.subtitle}>
        Empanelment statistics, pending applications, and engagement analytics.
      </p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Empanelment Summary</h3>
          <p style={styles.cardDesc}>Total empanelled experts by domain, category, and status. Quarterly review metrics.</p>
          <span style={styles.coming}>Coming Soon</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Contractual Engagements</h3>
          <p style={styles.cardDesc}>Active engagements, upcoming expirations, renewal tracking, and budget utilisation.</p>
          <span style={styles.coming}>Coming Soon</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Application Pipeline</h3>
          <p style={styles.cardDesc}>Applications by stage — submitted, auto-screened, committee-reviewed, approved, rejected.</p>
          <span style={styles.coming}>Coming Soon</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Audit Trail</h3>
          <p style={styles.cardDesc}>Action logs for compliance — who did what, when. Exportable for RTI and audit queries.</p>
          <span style={styles.coming}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },
  cardTitle: { margin: '0 0 8px', fontSize: '1rem' },
  cardDesc: { margin: '0 0 12px', fontSize: '0.85rem', color: '#555' },
  coming: {
    display: 'inline-block', padding: '3px 10px', background: '#e8eaf6',
    color: '#1a237e', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
  },
};
