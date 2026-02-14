/**
 * My Applications Page — Lists the user's empanelment and contractual applications.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getProfile, getMyEmpanelmentApplications, getMyContractualApplications } from '../services/api';

interface EmpanelmentApp {
  id: string;
  status: string;
  autoScreenCategory?: string;
  autoScreenEligible: boolean;
  empanelmentArea: string;
  submittedAt: string;
  createdAt: string;
  domain?: { name: string };
  subDomain?: { name: string };
  empanelmentRecord?: { validFrom: string; validTo: string } | null;
}

interface ContractualApp {
  id: string;
  status: string;
  autoScreenEligible: boolean;
  meetsQualification: boolean;
  meetsExperience: boolean;
  meetsAge: boolean;
  submittedAt: string;
  createdAt: string;
  advert?: {
    advertNumber: string;
    title: string;
    designation: string;
    engagementType: string;
  };
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  SUBMITTED: { bg: '#e3f2fd', fg: '#1565c0' },
  AUTO_SCREENED: { bg: '#e3f2fd', fg: '#1565c0' },
  SCREENING_PENDING: { bg: '#fff3e0', fg: '#e65100' },
  SCREENING_APPROVED: { bg: '#e8f5e9', fg: '#2e7d32' },
  SCREENING_REJECTED: { bg: '#fce4ec', fg: '#c62828' },
  EMPANELMENT_APPROVED: { bg: '#e8f5e9', fg: '#2e7d32' },
  EMPANELMENT_REJECTED: { bg: '#fce4ec', fg: '#c62828' },
  DG_APPROVED: { bg: '#e8f5e9', fg: '#1b5e20' },
  SHORTLISTED: { bg: '#e8f5e9', fg: '#2e7d32' },
  ENGAGED: { bg: '#e8f5e9', fg: '#1b5e20' },
  NOT_SELECTED: { bg: '#f5f5f5', fg: '#616161' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || { bg: '#f5f5f5', fg: '#333' };
  const label = status.replace(/_/g, ' ');
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', background: s.bg, color: s.fg, borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
      {label}
    </span>
  );
}

const AREA_LABELS: Record<string, string> = {
  CONSULTANCY: 'Consultancy',
  TRAINING: 'Training',
  BOTH: 'Both',
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [empanelmentApps, setEmpanelmentApps] = useState<EmpanelmentApp[]>([]);
  const [contractualApps, setContractualApps] = useState<ContractualApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profileRes = await getProfile();
        if (profileRes.success && profileRes.data?.id) {
          const pid = profileRes.data.id;
          setProfileId(pid);
          const [emp, cont] = await Promise.all([
            getMyEmpanelmentApplications(pid).catch(() => []),
            getMyContractualApplications(pid).catch(() => []),
          ]);
          setEmpanelmentApps(emp || []);
          setContractualApps(cont || []);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(err.message || 'Failed to load applications.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <p style={{ padding: 24 }}>Please log in.</p>;
  if (loading) return <p style={{ padding: 24, textAlign: 'center' }}>Loading applications...</p>;

  const hasNoApps = empanelmentApps.length === 0 && contractualApps.length === 0;

  return (
    <div className="page-container" style={S.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>My Applications</h2>
        <Link to="/dashboard" style={{ color: '#1a237e', fontSize: '0.9rem' }}>&larr; Back to Dashboard</Link>
      </div>

      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

      {hasNoApps && !error && (
        <div style={S.emptyBox}>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 16px' }}>
            You haven't submitted any applications yet.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/apply/empanelment" style={S.btn}>Apply for Empanelment</Link>
            <Link to="/adverts" style={{ ...S.btn, background: '#e65100' }}>View Open Positions</Link>
          </div>
        </div>
      )}

      {/* Empanelment Applications */}
      {empanelmentApps.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>Empanelment Applications ({empanelmentApps.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Domain</th>
                  <th style={S.th}>Area</th>
                  <th style={S.th}>Provisional Category</th>
                  <th style={S.th}>Auto-Screening</th>
                  <th style={S.th}>Submitted</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {empanelmentApps.map((a, i) => (
                  <tr key={a.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>
                      {a.domain?.name || '—'}
                      {a.subDomain?.name && <span style={{ fontSize: '0.78rem', color: '#888' }}> / {a.subDomain.name}</span>}
                    </td>
                    <td style={S.td}>{AREA_LABELS[a.empanelmentArea] || a.empanelmentArea}</td>
                    <td style={S.td}>{a.autoScreenCategory?.replace(/_/g, ' ') || '—'}</td>
                    <td style={S.td}>
                      <span style={{ color: a.autoScreenEligible ? '#2e7d32' : '#c62828', fontWeight: 600, fontSize: '0.85rem' }}>
                        {a.autoScreenEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                    <td style={S.td}>{new Date(a.submittedAt).toLocaleDateString('en-IN')}</td>
                    <td style={S.td}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {empanelmentApps.some(a => a.empanelmentRecord) && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#e8f5e9', borderRadius: 6, fontSize: '0.85rem' }}>
              You have an active empanelment record. You may be engaged on short notice for relevant assignments.
            </div>
          )}
        </div>
      )}

      {/* Contractual Applications */}
      {contractualApps.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>Contractual Applications ({contractualApps.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Advert</th>
                  <th style={S.th}>Designation</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Screening</th>
                  <th style={S.th}>Submitted</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {contractualApps.map((a, i) => (
                  <tr key={a.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>
                      <strong>{a.advert?.advertNumber || '—'}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#666' }}>{a.advert?.title || ''}</div>
                    </td>
                    <td style={S.td}>{a.advert?.designation?.replace(/_/g, ' ') || '—'}</td>
                    <td style={S.td}>{a.advert?.engagementType?.replace(/_/g, ' ') || '—'}</td>
                    <td style={S.td}>
                      <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                        <span style={{ color: a.meetsQualification ? '#2e7d32' : '#c62828' }}>
                          Qual: {a.meetsQualification ? 'Yes' : 'No'}
                        </span>
                        <br />
                        <span style={{ color: a.meetsExperience ? '#2e7d32' : '#c62828' }}>
                          Exp: {a.meetsExperience ? 'Yes' : 'No'}
                        </span>
                        <br />
                        <span style={{ color: a.meetsAge ? '#2e7d32' : '#c62828' }}>
                          Age: {a.meetsAge ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td style={S.td}>{new Date(a.submittedAt).toLocaleDateString('en-IN')}</td>
                    <td style={S.td}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '24px' },
  card: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { margin: '0 0 14px', color: '#1a237e', fontSize: '1.1rem', borderBottom: '2px solid #e8eaf6', paddingBottom: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  thRow: { background: '#e8eaf6' },
  th: { padding: '8px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #c5cae9', fontSize: '0.82rem' },
  td: { padding: '8px 10px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  emptyBox: { textAlign: 'center', padding: '40px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: 8 },
  btn: { display: 'inline-block', padding: '10px 24px', background: '#1a237e', color: '#fff', textDecoration: 'none', borderRadius: 5, fontWeight: 600, fontSize: '0.9rem' },
};
