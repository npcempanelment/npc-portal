/**
 * Committee screening dashboard — shows pending empanelment applications.
 * For Screening Committee members per Empanelment AI §2.2.
 */

import React, { useState, useEffect } from 'react';
import { getScreeningPendingEmpanelment } from '../services/api';

const CATEGORY_LABELS: Record<string, string> = {
  ADVISOR: 'Advisor',
  SENIOR_CONSULTANT: 'Senior Consultant',
  CONSULTANT: 'Consultant',
  PROJECT_ASSOCIATE: 'Project Associate',
  YOUNG_PROFESSIONAL: 'Young Professional',
};

export default function ScreeningDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getScreeningPendingEmpanelment(page)
      .then((res) => {
        setApplications(res.applications || []);
        setTotal(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={styles.container}><p>Loading pending applications...</p></div>;

  return (
    <div style={styles.container}>
      <h2>Screening Committee — Empanelment Applications</h2>
      <p style={styles.subtitle}>
        Total pending: {total} | Page {page}
      </p>

      {applications.length === 0 && (
        <p style={{ color: '#888' }}>No pending applications for review.</p>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Application #</th>
            <th style={styles.th}>Applicant</th>
            <th style={styles.th}>Domain</th>
            <th style={styles.th}>Auto-Screen</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Experience</th>
            <th style={styles.th}>Submitted</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td style={styles.td}>{app.applicationNumber?.slice(0, 8)}...</td>
              <td style={styles.td}>{app.profile?.user?.name || 'N/A'}</td>
              <td style={styles.td}>{app.domain?.name || 'N/A'}</td>
              <td style={styles.td}>
                <span style={{
                  color: app.autoScreenEligible ? '#2e7d32' : '#c62828',
                  fontWeight: 'bold',
                }}>
                  {app.autoScreenEligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </td>
              <td style={styles.td}>
                {CATEGORY_LABELS[app.autoScreenCategory] || app.autoScreenCategory || '—'}
              </td>
              <td style={styles.td}>{app.computedTotalExpYears?.toFixed(1) || '—'} yrs</td>
              <td style={styles.td}>
                {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—'}
              </td>
              <td style={styles.td}>
                <button style={styles.reviewBtn}>Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>Previous</button>
        <span>Page {page}</span>
        <button disabled={applications.length < 20} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>Next</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px' },
  subtitle: { color: '#666', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '0.85rem', color: '#555' },
  td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '0.9rem' },
  reviewBtn: { background: '#1a237e', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  pageBtn: { padding: '6px 16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
};
