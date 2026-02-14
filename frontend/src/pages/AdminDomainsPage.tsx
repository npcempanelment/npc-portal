/**
 * Admin page — view domains and sub-domains.
 */

import React, { useEffect, useState } from 'react';
import { getDomains } from '../services/api';
import type { Domain } from '../types';

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getDomains().then(d => { setDomains(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.container}><p>Loading domains...</p></div>;

  return (
    <div style={styles.container}>
      <h2>Domains &amp; Sub-Domains</h2>
      <p style={styles.subtitle}>
        Competency domains as per Empanelment AI §2 — 9 identified areas of NPC expertise.
      </p>

      <div style={styles.grid}>
        {domains.map(domain => (
          <div key={domain.id} style={styles.card}>
            <div style={styles.cardHeader} onClick={() => setExpanded(expanded === domain.id ? null : domain.id)}>
              <div>
                <span style={styles.code}>{domain.code}</span>
                <strong>{domain.name}</strong>
              </div>
              <span style={styles.count}>{domain.subDomains?.length || 0} sub-domains</span>
            </div>
            {expanded === domain.id && domain.subDomains?.length > 0 && (
              <ul style={styles.subList}>
                {domain.subDomains.map(sd => (
                  <li key={sd.id} style={styles.subItem}>{sd.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {domains.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>No domains found. Run seed data first.</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  grid: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', cursor: 'pointer',
  },
  code: {
    background: '#e8eaf6', color: '#1a237e', padding: '2px 8px', borderRadius: 4,
    fontSize: '0.8rem', fontWeight: 600, marginRight: 10,
  },
  count: { fontSize: '0.8rem', color: '#888' },
  subList: { margin: 0, padding: '0 20px 16px 48px', listStyle: 'disc' },
  subItem: { fontSize: '0.9rem', color: '#555', padding: '3px 0' },
};
