/**
 * Admin adverts list — view all adverts (draft, published, closed), publish drafts, create new.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllAdverts, publishAdvertApi } from '../services/api';
import type { Advert } from '../types';

export default function AdminAdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await getAllAdverts();
      setAdverts(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handlePublish(id: string) {
    if (!window.confirm('Publish this advert? It will become visible to applicants.')) return;
    try {
      await publishAdvertApi(id);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to publish');
    }
  }

  const filtered = filter === 'ALL' ? adverts : adverts.filter(a => a.status === filter);

  const statusColor: Record<string, string> = {
    DRAFT: '#ff9800', PUBLISHED: '#4caf50', CLOSED: '#9e9e9e',
    DG_APPROVED: '#2196f3', SELECTION_DONE: '#673ab7', CANCELLED: '#f44336',
  };

  if (loading) return <div style={styles.container}><p>Loading adverts...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={{ margin: 0 }}>Manage Advertisements</h2>
        <Link to="/admin/adverts/new" style={styles.createBtn}>+ Create New Advert</Link>
      </div>

      <div style={styles.filters}>
        {['ALL', 'DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ ...styles.filterBtn, ...(filter === s ? styles.filterActive : {}) }}>
            {s} {s === 'ALL' ? `(${adverts.length})` : `(${adverts.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No adverts found.</p>}

      <div style={styles.list}>
        {filtered.map(advert => (
          <div key={advert.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span style={{ ...styles.badge, background: statusColor[advert.status] || '#999' }}>
                  {advert.status}
                </span>
                <span style={styles.advertNo}>{advert.advertNumber}</span>
              </div>
              <span style={styles.meta}>{advert.numberOfPosts} post(s)</span>
            </div>
            <h3 style={styles.cardTitle}>{advert.title}</h3>
            <div style={styles.cardMeta}>
              <span>{advert.designation?.replace(/_/g, ' ')}</span>
              <span style={styles.dot}>•</span>
              <span>{advert.engagementType?.replace(/_/g, ' ')}</span>
              {advert.domain && <>
                <span style={styles.dot}>•</span>
                <span>{advert.domain.name}</span>
              </>}
              {advert.office && <>
                <span style={styles.dot}>•</span>
                <span>{advert.office.name}</span>
              </>}
            </div>
            {advert.remunerationMin && (
              <div style={styles.salary}>
                ₹{(advert.remunerationMin / 1000).toFixed(0)}K
                {advert.remunerationMax && advert.remunerationMax !== advert.remunerationMin
                  ? ` - ₹${(advert.remunerationMax / 1000).toFixed(0)}K` : ''}
                /{advert.remunerationBasis === 'DAILY' ? 'day' : 'month'}
              </div>
            )}
            {advert.lastDateToApply && (
              <div style={styles.deadline}>
                Last date: {new Date(advert.lastDateToApply).toLocaleDateString('en-IN')}
              </div>
            )}
            <div style={styles.cardActions}>
              <Link to={`/adverts/${advert.id}`} style={styles.viewBtn}>View</Link>
              <Link to={`/admin/adverts/${advert.id}/edit`} style={styles.editBtn}>Edit</Link>
              {advert.status === 'DRAFT' && (
                <button onClick={() => handlePublish(advert.id)} style={styles.publishBtn}>Publish</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1000, margin: '0 auto', padding: 24 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  createBtn: {
    padding: '10px 20px', background: '#1a237e', color: '#fff', borderRadius: 6,
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
  },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 14px', border: '1px solid #ccc', borderRadius: 20,
    background: '#fff', cursor: 'pointer', fontSize: '0.8rem',
  },
  filterActive: { background: '#1a237e', color: '#fff', borderColor: '#1a237e' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 },
  advertNo: { marginLeft: 10, fontSize: '0.8rem', color: '#888' },
  cardTitle: { margin: '4px 0 8px', fontSize: '1.05rem' },
  cardMeta: { fontSize: '0.85rem', color: '#666', marginBottom: 6 },
  dot: { margin: '0 6px' },
  salary: { fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600, marginBottom: 4 },
  deadline: { fontSize: '0.8rem', color: '#e65100' },
  meta: { fontSize: '0.8rem', color: '#888' },
  cardActions: { display: 'flex', gap: 8, marginTop: 12 },
  viewBtn: {
    padding: '6px 16px', border: '1px solid #1a237e', borderRadius: 4,
    color: '#1a237e', textDecoration: 'none', fontSize: '0.85rem',
  },
  editBtn: {
    padding: '6px 16px', border: '1px solid #ff9800', borderRadius: 4,
    color: '#e65100', textDecoration: 'none', fontSize: '0.85rem', background: '#fff3e0',
  },
  publishBtn: {
    padding: '6px 16px', background: '#4caf50', color: '#fff', border: 'none',
    borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem',
  },
};
