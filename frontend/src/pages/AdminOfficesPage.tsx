/**
 * Admin page — view NPC offices.
 */

import React, { useEffect, useState } from 'react';
import { getOffices } from '../services/api';
import type { NpcOffice } from '../types';

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState<NpcOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffices().then(o => { setOffices(o); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.container}><p>Loading offices...</p></div>;

  return (
    <div style={styles.container}>
      <h2>NPC Offices</h2>
      <p style={styles.subtitle}>Regional Directorates and NPC office locations.</p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Office Name</th>
            <th style={styles.th}>City</th>
            <th style={styles.th}>State</th>
          </tr>
        </thead>
        <tbody>
          {offices.map((o, i) => (
            <tr key={o.id} style={i % 2 === 0 ? {} : { background: '#f9f9f9' }}>
              <td style={styles.td}>{i + 1}</td>
              <td style={styles.td}>{o.name}</td>
              <td style={styles.td}>{o.city}</td>
              <td style={styles.td}>{o.state}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {offices.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>No offices found.</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#1a237e', color: '#fff', fontSize: '0.85rem' },
  td: { padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: '0.9rem' },
};
