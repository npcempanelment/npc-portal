/**
 * Admin reports — dashboard stats, application tables, CSV download.
 */

import React, { useEffect, useState } from 'react';
import {
  getReportStats,
  getContractualApplicationsReport,
  getEmpanelmentApplicationsReport,
} from '../services/api';

interface Stats {
  summary: {
    totalAdverts: number;
    publishedAdverts: number;
    totalContractualApps: number;
    eligibleContractualApps: number;
    totalEmpanelmentApps: number;
    eligibleEmpanelmentApps: number;
    totalProfiles: number;
    totalUsers: number;
  };
  contractualByStatus: { status: string; count: number }[];
  empanelmentByStatus: { status: string; count: number }[];
  appsPerAdvert: {
    advertNumber: string;
    title: string;
    designation: string;
    numberOfPosts: number;
    lastDateToApply: string | null;
    applicationCount: number;
  }[];
}

interface DocInfo {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface ContractualRow {
  id: string;
  advertNumber: string;
  advertTitle: string;
  designation: string;
  engagementType: string;
  applicantName: string;
  email: string;
  dob: string;
  gender: string;
  backgroundType: string;
  currentOrganization: string | null;
  currentDesignation: string | null;
  totalExperience: number | null;
  computedAge: number | null;
  autoScreenEligible: boolean;
  meetsQualification: boolean;
  meetsExperience: boolean;
  meetsAge: boolean;
  screeningReasons: string[];
  status: string;
  submittedAt: string;
  documentsCount: number;
  documents: DocInfo[];
}

interface EmpanelmentRow {
  id: string;
  domain: string | null;
  subDomain: string | null;
  empanelmentArea: string;
  applicantName: string;
  email: string;
  dob: string;
  backgroundType: string;
  totalExperience: number | null;
  groupAYears: number | null;
  level12Years: number | null;
  autoScreenEligible: boolean;
  provisionalCategory: string | null;
  screeningReasons: string[];
  status: string;
  submittedAt: string;
  documentsCount: number;
  documents: DocInfo[];
}

type Tab = 'overview' | 'contractual' | 'empanelment';

export default function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [contractualApps, setContractualApps] = useState<ContractualRow[]>([]);
  const [empanelmentApps, setEmpanelmentApps] = useState<EmpanelmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [docModal, setDocModal] = useState<{ applicantName: string; documents: DocInfo[] } | null>(null);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const data = await getReportStats();
      setStats(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function loadContractual() {
    if (contractualApps.length > 0) return;
    try {
      const data = await getContractualApplicationsReport();
      setContractualApps(data);
    } catch { /* ignore */ }
  }

  async function loadEmpanelment() {
    if (empanelmentApps.length > 0) return;
    try {
      const data = await getEmpanelmentApplicationsReport();
      setEmpanelmentApps(data);
    } catch { /* ignore */ }
  }

  function downloadCsv(type: 'contractual' | 'empanelment') {
    const token = localStorage.getItem('npc_token');
    const url = type === 'contractual'
      ? '/api/admin/reports/contractual-applications?format=csv'
      : '/api/admin/reports/empanelment-applications?format=csv';

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = type === 'contractual'
          ? 'contractual_applications_report.csv'
          : 'empanelment_applications_report.csv';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  if (loading) return <div style={styles.container}><p>Loading reports...</p></div>;

  return (
    <div className="page-container" style={styles.container}>
      <h2>Reports &amp; Statistics</h2>

      <div className="tab-bar" style={styles.tabs}>
        {(['overview', 'contractual', 'empanelment'] as Tab[]).map(t => (
          <button key={t} onClick={() => {
            setTab(t);
            if (t === 'contractual') loadContractual();
            if (t === 'empanelment') loadEmpanelment();
          }} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t === 'overview' ? 'Dashboard Overview' : t === 'contractual' ? 'Contractual Applications' : 'Empanelment Applications'}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && <OverviewTab stats={stats} />}
      {tab === 'contractual' && (
        <ApplicationsTab
          type="contractual"
          data={contractualApps}
          onDownload={() => downloadCsv('contractual')}
          onViewDocs={(name, docs) => setDocModal({ applicantName: name, documents: docs })}
        />
      )}
      {tab === 'empanelment' && (
        <ApplicationsTab
          type="empanelment"
          data={empanelmentApps}
          onDownload={() => downloadCsv('empanelment')}
          onViewDocs={(name, docs) => setDocModal({ applicantName: name, documents: docs })}
        />
      )}

      {docModal && (
        <DocumentModal
          applicantName={docModal.applicantName}
          documents={docModal.documents}
          onClose={() => setDocModal(null)}
        />
      )}
    </div>
  );
}

function OverviewTab({ stats }: { stats: Stats }) {
  const s = stats.summary;
  return (
    <div>
      {/* Summary Cards */}
      <div className="stat-grid" style={styles.statGrid}>
        <StatCard label="Total Applicants" value={s.totalProfiles} color="#1a237e" />
        <StatCard label="Published Adverts" value={s.publishedAdverts} sub={`of ${s.totalAdverts} total`} color="#0d47a1" />
        <StatCard label="Contractual Applications" value={s.totalContractualApps} sub={`${s.eligibleContractualApps} eligible`} color="#2e7d32" />
        <StatCard label="Empanelment Applications" value={s.totalEmpanelmentApps} sub={`${s.eligibleEmpanelmentApps} eligible`} color="#e65100" />
      </div>

      {/* Applications by Status */}
      {stats.contractualByStatus.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={styles.sectionTitle}>Contractual Applications by Status</h3>
          <div style={styles.statusGrid}>
            {stats.contractualByStatus.map(s => (
              <div key={s.status} style={styles.statusChip}>
                <span style={styles.statusLabel}>{s.status.replace(/_/g, ' ')}</span>
                <span style={styles.statusCount}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.empanelmentByStatus.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={styles.sectionTitle}>Empanelment Applications by Status</h3>
          <div style={styles.statusGrid}>
            {stats.empanelmentByStatus.map(s => (
              <div key={s.status} style={styles.statusChip}>
                <span style={styles.statusLabel}>{s.status.replace(/_/g, ' ')}</span>
                <span style={styles.statusCount}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications per Advert */}
      {stats.appsPerAdvert.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={styles.sectionTitle}>Applications per Published Advert</h3>
          <div className="table-responsive">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Advert No.</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Posts</th>
                <th style={styles.th}>Last Date</th>
                <th style={styles.th}>Applications</th>
              </tr>
            </thead>
            <tbody>
              {stats.appsPerAdvert.map((a, i) => (
                <tr key={a.advertNumber} style={i % 2 ? { background: '#f9f9f9' } : {}}>
                  <td style={styles.td}>{a.advertNumber}</td>
                  <td style={styles.td}>{a.title.substring(0, 45)}{a.title.length > 45 ? '...' : ''}</td>
                  <td style={styles.td}>{a.designation.replace(/_/g, ' ')}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{a.numberOfPosts}</td>
                  <td style={styles.td}>{a.lastDateToApply ? new Date(a.lastDateToApply).toLocaleDateString('en-IN') : '-'}</td>
                  <td style={{ ...styles.td, textAlign: 'center', fontWeight: 600 }}>{a.applicationCount}</td>
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

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#555' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ApplicationsTab({ type, data, onDownload, onViewDocs }: {
  type: 'contractual' | 'empanelment';
  data: any[];
  onDownload: () => void;
  onViewDocs: (applicantName: string, docs: DocInfo[]) => void;
}) {
  if (data.length === 0) {
    return (
      <div>
        <div className="download-bar" style={styles.downloadBar}>
          <span style={{ color: '#888' }}>No {type} applications found.</span>
          <button onClick={onDownload} style={styles.downloadBtn}>Download CSV</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="download-bar" style={styles.downloadBar}>
        <span style={{ fontSize: '0.9rem' }}>
          <strong>{data.length}</strong> {type} application(s)
        </span>
        <button onClick={onDownload} style={styles.downloadBtn}>Download CSV (Excel)</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {type === 'contractual' ? (
          <ContractualTable data={data as ContractualRow[]} onViewDocs={onViewDocs} />
        ) : (
          <EmpanelmentTable data={data as EmpanelmentRow[]} onViewDocs={onViewDocs} />
        )}
      </div>
    </div>
  );
}

function ContractualTable({ data, onViewDocs }: { data: ContractualRow[]; onViewDocs: (name: string, docs: DocInfo[]) => void }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Applicant</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Advert</th>
          <th style={styles.th}>Designation</th>
          <th style={styles.th}>Type</th>
          <th style={styles.th}>Exp (Yrs)</th>
          <th style={styles.th}>Age</th>
          <th style={styles.th}>Qual</th>
          <th style={styles.th}>Exp</th>
          <th style={styles.th}>Age</th>
          <th style={styles.th}>Eligible</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Docs</th>
          <th style={styles.th}>Submitted</th>
        </tr>
      </thead>
      <tbody>
        {data.map((a, i) => (
          <tr key={a.id} style={i % 2 ? { background: '#f9f9f9' } : {}}>
            <td style={styles.td}>{i + 1}</td>
            <td style={styles.td}><strong>{a.applicantName}</strong></td>
            <td style={styles.td}>{a.email}</td>
            <td style={styles.td}>{a.advertNumber}</td>
            <td style={styles.td}>{a.designation.replace(/_/g, ' ')}</td>
            <td style={styles.td}>{a.engagementType.replace(/_/g, ' ')}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}>{a.totalExperience?.toFixed(1) ?? '-'}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}>{a.computedAge ?? '-'}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}><Check ok={a.meetsQualification} /></td>
            <td style={{ ...styles.td, textAlign: 'center' }}><Check ok={a.meetsExperience} /></td>
            <td style={{ ...styles.td, textAlign: 'center' }}><Check ok={a.meetsAge} /></td>
            <td style={{ ...styles.td, textAlign: 'center' }}><Check ok={a.autoScreenEligible} /></td>
            <td style={styles.td}><StatusBadge status={a.status} /></td>
            <td style={{ ...styles.td, textAlign: 'center' }}>
              {a.documentsCount > 0 ? (
                <button onClick={() => onViewDocs(a.applicantName, a.documents)} style={styles.docLink}>
                  {a.documentsCount} file{a.documentsCount > 1 ? 's' : ''}
                </button>
              ) : '-'}
            </td>
            <td style={styles.td}>{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmpanelmentTable({ data, onViewDocs }: { data: EmpanelmentRow[]; onViewDocs: (name: string, docs: DocInfo[]) => void }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Applicant</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>Domain</th>
          <th style={styles.th}>Area</th>
          <th style={styles.th}>Background</th>
          <th style={styles.th}>Exp (Yrs)</th>
          <th style={styles.th}>Group A</th>
          <th style={styles.th}>L12+</th>
          <th style={styles.th}>Eligible</th>
          <th style={styles.th}>Category</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Docs</th>
          <th style={styles.th}>Submitted</th>
        </tr>
      </thead>
      <tbody>
        {data.map((a, i) => (
          <tr key={a.id} style={i % 2 ? { background: '#f9f9f9' } : {}}>
            <td style={styles.td}>{i + 1}</td>
            <td style={styles.td}><strong>{a.applicantName}</strong></td>
            <td style={styles.td}>{a.email}</td>
            <td style={styles.td}>{a.domain || '-'}</td>
            <td style={styles.td}>{a.empanelmentArea}</td>
            <td style={styles.td}>{a.backgroundType.replace(/_/g, ' ')}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}>{a.totalExperience?.toFixed(1) ?? '-'}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}>{a.groupAYears?.toFixed(1) ?? '-'}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}>{a.level12Years?.toFixed(1) ?? '-'}</td>
            <td style={{ ...styles.td, textAlign: 'center' }}><Check ok={a.autoScreenEligible} /></td>
            <td style={styles.td}>{a.provisionalCategory?.replace(/_/g, ' ') || '-'}</td>
            <td style={styles.td}><StatusBadge status={a.status} /></td>
            <td style={{ ...styles.td, textAlign: 'center' }}>
              {a.documentsCount > 0 ? (
                <button onClick={() => onViewDocs(a.applicantName, a.documents)} style={styles.docLink}>
                  {a.documentsCount} file{a.documentsCount > 1 ? 's' : ''}
                </button>
              ) : '-'}
            </td>
            <td style={styles.td}>{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Check({ ok }: { ok: boolean }) {
  return <span style={{ color: ok ? '#2e7d32' : '#c62828', fontWeight: 700 }}>{ok ? 'Y' : 'N'}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUBMITTED: '#1565c0', AUTO_SCREENED: '#6a1b9a', SCREENING_PENDING: '#ef6c00',
    SCREENING_APPROVED: '#2e7d32', SCREENING_REJECTED: '#c62828',
    EMPANELMENT_PENDING: '#0277bd', EMPANELED: '#1b5e20', REJECTED: '#b71c1c',
  };
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
      background: (colors[status] || '#757575') + '18',
      color: colors[status] || '#757575',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function DocumentModal({ applicantName, documents, onClose }: {
  applicantName: string;
  documents: DocInfo[];
  onClose: () => void;
}) {
  const docTypeLabels: Record<string, string> = {
    RESUME: 'Resume / CV',
    ID_PROOF: 'ID Proof',
    QUALIFICATION: 'Qualification Certificate',
    EXPERIENCE: 'Experience Certificate',
    PHOTO: 'Passport Photo',
    PPO: 'PPO / Pension Order',
    CERTIFICATION: 'Certification',
    OTHER: 'Other Document',
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div className="modal-content" style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={{ margin: 0 }}>Documents — {applicantName}</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
        </div>
        <div style={modalStyles.body}>
          {documents.length === 0 ? (
            <p style={{ color: '#888' }}>No documents uploaded.</p>
          ) : (
            <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={modalStyles.th}>#</th>
                  <th style={modalStyles.th}>Document Type</th>
                  <th style={modalStyles.th}>File Name</th>
                  <th style={modalStyles.th}>Uploaded</th>
                  <th style={modalStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, i) => (
                  <tr key={doc.id} style={i % 2 ? { background: '#f5f5f5' } : {}}>
                    <td style={modalStyles.td}>{i + 1}</td>
                    <td style={modalStyles.td}>{docTypeLabels[doc.documentType] || doc.documentType}</td>
                    <td style={modalStyles.td}>{doc.fileName}</td>
                    <td style={modalStyles.td}>
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={modalStyles.td}>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={modalStyles.viewBtn}
                      >
                        View
                      </a>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        style={modalStyles.downloadBtn}
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 10, width: '90%', maxWidth: 750,
    maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', borderBottom: '1px solid #e0e0e0', background: '#1a237e', color: '#fff',
    borderRadius: '10px 10px 0 0',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem',
    cursor: 'pointer', lineHeight: 1,
  },
  body: { padding: '20px 24px' },
  th: {
    textAlign: 'left', padding: '8px 12px', background: '#f0f0f0',
    fontSize: '0.8rem', fontWeight: 600, borderBottom: '2px solid #ddd',
  },
  td: { padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '0.85rem' },
  viewBtn: {
    padding: '3px 10px', background: '#1565c0', color: '#fff', borderRadius: 4,
    textDecoration: 'none', fontSize: '0.75rem', marginRight: 6,
  },
  downloadBtn: {
    padding: '3px 10px', background: '#2e7d32', color: '#fff', borderRadius: 4,
    textDecoration: 'none', fontSize: '0.75rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1200, margin: '0 auto', padding: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: {
    padding: '8px 20px', border: '1px solid #ccc', borderRadius: 6,
    background: '#fff', cursor: 'pointer', fontSize: '0.9rem',
  },
  tabActive: { background: '#1a237e', color: '#fff', borderColor: '#1a237e' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 },
  statCard: {
    background: '#fff', padding: '20px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: { fontSize: '1rem', margin: '0 0 12px', color: '#333' },
  statusGrid: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  statusChip: {
    display: 'flex', gap: 8, alignItems: 'center', padding: '6px 14px',
    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20,
  },
  statusLabel: { fontSize: '0.8rem', color: '#555' },
  statusCount: { fontSize: '0.9rem', fontWeight: 700, color: '#1a237e' },
  downloadBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, padding: '10px 16px', background: '#e8f5e9',
    border: '1px solid #c8e6c9', borderRadius: 8,
  },
  downloadBtn: {
    padding: '8px 20px', background: '#2e7d32', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8,
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontSize: '0.8rem',
  },
  th: {
    textAlign: 'left', padding: '8px 10px', background: '#1a237e', color: '#fff',
    fontSize: '0.75rem', whiteSpace: 'nowrap',
  },
  td: { padding: '6px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' },
  docLink: {
    background: 'none', border: 'none', color: '#1565c0', cursor: 'pointer',
    textDecoration: 'underline', fontSize: '0.8rem', fontWeight: 600, padding: 0,
  },
};
