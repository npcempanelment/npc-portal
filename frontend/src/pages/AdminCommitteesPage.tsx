/**
 * Admin page — committee management (placeholder with info).
 */

import React from 'react';

export default function AdminCommitteesPage() {
  return (
    <div style={styles.container}>
      <h2>Committee Management</h2>
      <p style={styles.subtitle}>
        Constitute and manage Screening &amp; Empanelment Committees as per AI §3.
      </p>

      <div style={styles.grid}>
        <InfoCard
          title="Screening Committee (Empanelment)"
          description="Reviews auto-screened empanelment applications. Approves, rejects, or refers back with remarks. Must have quorum to meet."
          reference="AI §3.1"
        />
        <InfoCard
          title="Empanelment Committee"
          description="Domain-specific committee that evaluates screened candidates via interview/presentation. Assigns final category and recommends to DG."
          reference="AI §3.2"
        />
        <InfoCard
          title="Screening Committee (Contractual)"
          description="Reviews auto-screened contractual applications per advert. Shortlists candidates for selection committee."
          reference="AI-858 §4"
        />
        <InfoCard
          title="Selection Committee"
          description="Conducts interviews for contractual positions. Scores candidates and recommends for engagement order."
          reference="AI-858 §5"
        />
      </div>

      <div style={styles.infoBox}>
        <strong>Note:</strong> Committee constitution requires DG approval. Members can be assigned via the
        backend database. A dedicated committee management UI with member assignment, meeting scheduling,
        and minutes recording is planned for a future release.
      </div>
    </div>
  );
}

function InfoCard({ title, description, reference }: { title: string; description: string; reference: string }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={styles.ref}>{reference}</span>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#555' }}>{description}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ref: { fontSize: '0.75rem', color: '#1a237e', background: '#e8eaf6', padding: '2px 8px', borderRadius: 4 },
  infoBox: {
    marginTop: 24, padding: '16px 20px', background: '#fff3e0',
    border: '1px solid #ffe0b2', borderRadius: 8, fontSize: '0.85rem', color: '#e65100',
  },
};
