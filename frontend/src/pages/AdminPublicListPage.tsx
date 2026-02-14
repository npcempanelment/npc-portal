/**
 * Admin page — public empanelment list management (placeholder).
 */

import React from 'react';

export default function AdminPublicListPage() {
  return (
    <div style={styles.container}>
      <h2>Public Empanelment List</h2>
      <p style={styles.subtitle}>
        Manage the empanelled experts list published on the NPC website (updated quarterly).
      </p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Quarterly Update Process</h3>
        <ol style={styles.steps}>
          <li>Review all active empanelment records with valid 3-year tenure</li>
          <li>Filter by domain and category for public display</li>
          <li>Generate expert list with name, domain, category, and empanelment number</li>
          <li>Publish updated list to NPC website after DG approval</li>
          <li>Remove expired empanelments (3-year validity exceeded)</li>
        </ol>
        <span style={styles.ref}>AI §7 — Quarterly publication on NPC website</span>
      </div>

      <div style={styles.infoBox}>
        <strong>Note:</strong> This feature will integrate with the NPC website CMS to automatically
        publish the empanelled experts list. Currently, the list can be exported from the database
        and uploaded manually.
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, marginBottom: 16 },
  cardTitle: { margin: '0 0 12px', fontSize: '1rem' },
  steps: { margin: 0, paddingLeft: 20, fontSize: '0.9rem', color: '#444', lineHeight: 1.8 },
  ref: { display: 'block', marginTop: 12, fontSize: '0.8rem', color: '#1a237e', fontWeight: 600 },
  infoBox: {
    padding: '16px 20px', background: '#e8f5e9',
    border: '1px solid #c8e6c9', borderRadius: 8, fontSize: '0.85rem', color: '#2e7d32',
  },
};
