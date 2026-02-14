/**
 * Profile Page — View and edit applicant profile.
 * Displays personal details, education, experience, certifications, and uploaded documents.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getProfile } from '../services/api';

interface ProfileData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  fatherOrMotherOrSpouseName?: string;
  backgroundType: string;
  correspondenceAddress?: string;
  permanentAddress?: string;
  contactNumbers: string[];
  aadhaarNumber?: string;
  panNumber?: string;
  lastOrganization?: string;
  lastDesignation?: string;
  lastPayLevel?: string;
  retirementDate?: string;
  ppoNumber?: string;
  photoUrl?: string;
  educations: {
    id: string;
    degree: string;
    field: string;
    institution: string;
    university?: string;
    yearOfPassing: number;
    grade?: string;
    isPremierInstitute: boolean;
    isDoctorate: boolean;
    isPostGraduation: boolean;
  }[];
  experiences: {
    id: string;
    organization: string;
    designation: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    isGroupAService: boolean;
    payLevel?: string;
    isLevel12OrAbove: boolean;
    payBandOrRemuneration?: string;
    dutiesDescription?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuingBody: string;
    yearObtained?: number;
    certificateNumber?: string;
  }[];
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  }[];
}

const BACKGROUND_LABELS: Record<string, string> = {
  GOVERNMENT_GROUP_A: 'Government (Group A)',
  GOVERNMENT_OTHER: 'Government (Other)',
  CPSE: 'CPSE',
  AUTONOMOUS_BODY: 'Autonomous Body',
  PRIVATE_SECTOR: 'Private Sector',
  ACADEMIC: 'Academic / University',
  SELF_EMPLOYED: 'Self Employed',
  FRESH_GRADUATE: 'Fresh Graduate',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(err.message || 'Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <p style={{ padding: 24 }}>Please log in.</p>;
  if (loading) return <p style={{ padding: 24, textAlign: 'center' }}>Loading profile...</p>;

  if (!profile) {
    return (
      <div style={S.container}>
        <h2>My Profile</h2>
        <div style={S.emptyBox}>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: '0 0 16px' }}>
            You haven't created a profile yet.
          </p>
          <p style={{ color: '#888', margin: '0 0 20px' }}>
            Your profile will be created automatically when you apply for empanelment or a contractual position.
            All your personal details, education, experience, and certifications will be saved.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/apply/empanelment" style={S.btn}>Apply for Empanelment</Link>
            <Link to="/adverts" style={{ ...S.btn, background: '#e65100' }}>View Open Positions</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;

  const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={S.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>My Profile</h2>
        <Link to="/dashboard" style={{ color: '#1a237e', fontSize: '0.9rem' }}>&larr; Back to Dashboard</Link>
      </div>

      {/* Personal Details */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Personal Details</h3>
        <div style={S.fieldGrid}>
          <Field label="Full Name" value={profile.fullName} />
          <Field label="Date of Birth" value={dob} />
          <Field label="Gender" value={profile.gender || '—'} />
          <Field label="Background" value={BACKGROUND_LABELS[profile.backgroundType] || profile.backgroundType} />
          <Field label="Father/Mother/Spouse" value={profile.fatherOrMotherOrSpouseName} />
          <Field label="Contact Numbers" value={profile.contactNumbers?.join(', ')} />
          <Field label="Aadhaar" value={profile.aadhaarNumber ? '****' + profile.aadhaarNumber.slice(-4) : '—'} />
          <Field label="PAN" value={profile.panNumber || '—'} />
        </div>
        {profile.correspondenceAddress && (
          <div style={{ marginTop: 8 }}>
            <span style={S.fieldLabel}>Correspondence Address:</span>
            <span style={S.fieldValue}>{profile.correspondenceAddress}</span>
          </div>
        )}
        {profile.permanentAddress && (
          <div style={{ marginTop: 4 }}>
            <span style={S.fieldLabel}>Permanent Address:</span>
            <span style={S.fieldValue}>{profile.permanentAddress}</span>
          </div>
        )}
        {profile.lastOrganization && (
          <>
            <h4 style={{ ...S.subHead, marginTop: 16 }}>Previous Employment (Govt/PSU)</h4>
            <div style={S.fieldGrid}>
              <Field label="Last Organization" value={profile.lastOrganization} />
              <Field label="Last Designation" value={profile.lastDesignation} />
              <Field label="Last Pay Level" value={profile.lastPayLevel} />
              <Field label="Retirement Date" value={profile.retirementDate ? new Date(profile.retirementDate).toLocaleDateString('en-IN') : '—'} />
              <Field label="PPO Number" value={profile.ppoNumber} />
            </div>
          </>
        )}
      </div>

      {/* Education */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Education ({profile.educations.length})</h3>
        {profile.educations.length === 0 ? (
          <p style={S.emptyText}>No education records.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Degree</th>
                  <th style={S.th}>Field</th>
                  <th style={S.th}>Institution</th>
                  <th style={S.th}>Year</th>
                  <th style={S.th}>Grade</th>
                  <th style={S.th}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {profile.educations.map((e, i) => (
                  <tr key={e.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>{e.degree}</td>
                    <td style={S.td}>{e.field}</td>
                    <td style={S.td}>{e.institution}{e.university ? ` (${e.university})` : ''}</td>
                    <td style={S.td}>{e.yearOfPassing}</td>
                    <td style={S.td}>{e.grade || '—'}</td>
                    <td style={S.td}>
                      {e.isDoctorate && <span style={S.tag}>Doctorate</span>}
                      {e.isPostGraduation && <span style={S.tag}>PG</span>}
                      {e.isPremierInstitute && <span style={{ ...S.tag, background: '#e8f5e9', color: '#2e7d32' }}>Premier</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Experience */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Experience ({profile.experiences.length})</h3>
        {profile.experiences.length === 0 ? (
          <p style={S.emptyText}>No experience records.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Organization</th>
                  <th style={S.th}>Designation</th>
                  <th style={S.th}>Period</th>
                  <th style={S.th}>Pay Level</th>
                  <th style={S.th}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {profile.experiences.map((e, i) => {
                  const start = new Date(e.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                  const end = e.isCurrent ? 'Present' : e.endDate ? new Date(e.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
                  return (
                    <tr key={e.id}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={S.td}>{e.organization}</td>
                      <td style={S.td}>{e.designation}</td>
                      <td style={S.td}>{start} – {end}</td>
                      <td style={S.td}>{e.payLevel || '—'}</td>
                      <td style={S.td}>
                        {e.isCurrent && <span style={S.tag}>Current</span>}
                        {e.isGroupAService && <span style={{ ...S.tag, background: '#fce4ec', color: '#c62828' }}>Group A</span>}
                        {e.isLevel12OrAbove && <span style={{ ...S.tag, background: '#fff3e0', color: '#e65100' }}>L12+</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>Certifications ({profile.certifications.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Certification</th>
                  <th style={S.th}>Issuing Body</th>
                  <th style={S.th}>Year</th>
                  <th style={S.th}>Certificate No.</th>
                </tr>
              </thead>
              <tbody>
                {profile.certifications.map((c, i) => (
                  <tr key={c.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>{c.name}</td>
                    <td style={S.td}>{c.issuingBody}</td>
                    <td style={S.td}>{c.yearObtained || '—'}</td>
                    <td style={S.td}>{c.certificateNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents */}
      {profile.documents.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>Uploaded Documents ({profile.documents.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr style={S.thRow}>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>File Name</th>
                  <th style={S.th}>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {profile.documents.map((d, i) => (
                  <tr key={d.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}><span style={S.docTag}>{d.documentType}</span></td>
                    <td style={S.td}>{d.fileName}</td>
                    <td style={S.td}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
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

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span style={S.fieldLabel}>{label}:</span>
      <span style={S.fieldValue}>{value || '—'}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 960, margin: '0 auto', padding: '24px' },
  card: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { margin: '0 0 14px', color: '#1a237e', fontSize: '1.1rem', borderBottom: '2px solid #e8eaf6', paddingBottom: 8 },
  subHead: { color: '#1a237e', fontSize: '0.95rem', margin: '0 0 8px' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 20px' },
  fieldLabel: { fontSize: '0.82rem', color: '#888', marginRight: 6 },
  fieldValue: { fontSize: '0.9rem', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  thRow: { background: '#e8eaf6' },
  th: { padding: '8px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #c5cae9', fontSize: '0.82rem' },
  td: { padding: '7px 10px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  tag: { display: 'inline-block', padding: '1px 8px', background: '#e3f2fd', color: '#1565c0', borderRadius: 10, fontSize: '0.72rem', marginRight: 4, fontWeight: 500 },
  docTag: { display: 'inline-block', padding: '2px 8px', background: '#e8eaf6', color: '#1a237e', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' },
  emptyText: { color: '#999', fontStyle: 'italic', margin: 0 },
  emptyBox: { textAlign: 'center', padding: '40px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: 8 },
  btn: { display: 'inline-block', padding: '10px 24px', background: '#1a237e', color: '#fff', textDecoration: 'none', borderRadius: 5, fontWeight: 600, fontSize: '0.9rem' },
};
