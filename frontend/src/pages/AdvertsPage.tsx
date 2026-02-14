/**
 * Public advertisements listing page — job-portal style.
 * Visitors can see key data at a glance: designation, eligibility,
 * experience, salary, location, deadline — without downloading any PDF.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedAdverts } from '../services/api';
import type { Advert } from '../types';

const DESIGNATION_LABELS: Record<string, string> = {
  SUPPORT_EXECUTIVE: 'Support Executive',
  OFFICE_EXECUTIVE: 'Office Executive / Data Entry Operator',
  ACCOUNTS_EXECUTIVE: 'Accounts Executive',
  TECHNICAL_EXECUTIVE: 'Technical Executive',
  LEGAL_EXECUTIVE: 'Legal Executive',
  PROJECT_EXECUTIVE: 'Project Executive / Research Executive',
  RESEARCH_EXECUTIVE: 'Research Executive',
  SENIOR_PROFESSIONAL: 'Senior Professional',
  YOUNG_PROFESSIONAL_CONTRACT: 'Young Professional',
  CONSULTANT_CONTRACT: 'Consultant',
  SENIOR_CONSULTANT_CONTRACT: 'Senior Consultant',
  ADVISOR_CONTRACT: 'Advisor',
  SENIOR_ADVISOR: 'Senior Advisor',
  EXPERT_RETIRED: 'Expert (Retired Govt/CPSE)',
};

const ENGAGEMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  LUMP_SUM: 'Lump Sum / Milestone',
  REVENUE_SHARE: 'Revenue Sharing',
  RESOURCE_PERSON: 'Resource Person',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function daysRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getPublishedAdverts()
      .then(setAdverts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = adverts.filter(a => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (DESIGNATION_LABELS[a.designation] || a.designation).toLowerCase().includes(q) ||
      a.domain?.name.toLowerCase().includes(q) ||
      a.office?.city.toLowerCase().includes(q) ||
      a.placeOfDeployment?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading open positions...</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={styles.container}>
      {/* Header section */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Current Openings</h2>
        <p style={styles.pageSubtitle}>
          National Productivity Council — Contractual Engagement Opportunities
        </p>
        <p style={styles.aiRef}>
          As per Administrative Instruction No. 858/2026 (Engagement of persons on Contract Basis)
        </p>
      </div>

      {/* Search / filter bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by title, designation, domain, or location..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.resultCount}>
          {filtered.length} position{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>No open positions at this time</p>
          <p style={{ color: '#888', margin: 0 }}>Please check back later or register to get notified of new openings.</p>
        </div>
      )}

      {/* Job cards */}
      <div style={styles.jobList}>
        {filtered.map((advert) => {
          const days = advert.lastDateToApply ? daysRemaining(advert.lastDateToApply) : null;
          const isUrgent = days !== null && days <= 5;

          return (
            <div key={advert.id} style={styles.jobCard}>
              {/* Top row: badges */}
              <div style={styles.badgeRow}>
                <span style={styles.badgeType}>
                  {ENGAGEMENT_LABELS[advert.engagementType] || advert.engagementType}
                </span>
                {advert.numberOfPosts > 1 && (
                  <span style={styles.badgePosts}>{advert.numberOfPosts} Posts</span>
                )}
                {isUrgent && <span style={styles.badgeUrgent}>Closing Soon!</span>}
              </div>

              {/* Title */}
              <h3 style={styles.jobTitle}>{advert.title}</h3>
              <p style={styles.advertNo}>{advert.advertNumber}</p>

              {/* Key info grid */}
              <div style={styles.infoGrid}>
                <InfoItem
                  icon="briefcase"
                  label="Designation"
                  value={DESIGNATION_LABELS[advert.designation] || advert.designation}
                />
                {advert.domain && (
                  <InfoItem icon="folder" label="Domain" value={advert.domain.name} />
                )}
                <InfoItem
                  icon="location"
                  label="Location"
                  value={advert.placeOfDeployment || advert.office?.city || 'As specified'}
                />
                {advert.minExperienceYears != null && (
                  <InfoItem
                    icon="clock"
                    label="Experience"
                    value={`${advert.minExperienceYears}+ years`}
                  />
                )}
                {advert.minQualification && (
                  <InfoItem icon="graduation" label="Qualification" value={advert.minQualification} />
                )}
                {(advert.remunerationMin || advert.remunerationMax) && (
                  <InfoItem
                    icon="money"
                    label="Remuneration"
                    value={
                      advert.remunerationMin && advert.remunerationMax && advert.remunerationMin !== advert.remunerationMax
                        ? `${formatCurrency(advert.remunerationMin)} - ${formatCurrency(advert.remunerationMax)}/${advert.remunerationBasis === 'DAILY' ? 'day' : 'month'}`
                        : advert.remunerationMax
                          ? `Up to ${formatCurrency(advert.remunerationMax)}/${advert.remunerationBasis === 'DAILY' ? 'day' : 'month'}`
                          : `${formatCurrency(advert.remunerationMin!)}/${advert.remunerationBasis === 'DAILY' ? 'day' : 'month'}`
                    }
                  />
                )}
                {advert.contractPeriodMonths && (
                  <InfoItem icon="calendar" label="Duration" value={`${advert.contractPeriodMonths} months`} />
                )}
                {advert.maxAge && (
                  <InfoItem icon="user" label="Max Age" value={`${advert.maxAge} years`} />
                )}
              </div>

              {/* Quick description */}
              {advert.functionalRole && (
                <p style={styles.roleDesc}>{advert.functionalRole}</p>
              )}

              {/* Footer: deadline + actions */}
              <div style={styles.cardFooter}>
                <div>
                  {advert.lastDateToApply && (
                    <span style={{ ...styles.deadline, color: isUrgent ? '#c62828' : '#555' }}>
                      Last Date: {new Date(advert.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {days !== null && ` (${days} day${days !== 1 ? 's' : ''} left)`}
                    </span>
                  )}
                </div>
                <div className="advert-card-actions" style={styles.cardActions}>
                  <Link to={`/adverts/${advert.id}`} style={styles.viewBtn}>
                    View Full Details
                  </Link>
                  <Link to={`/apply/contractual/${advert.id}`} style={styles.applyBtn}>
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* General info box */}
      <div style={styles.infoBox}>
        <h4 style={{ margin: '0 0 8px' }}>General Information</h4>
        <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', fontSize: '0.9rem' }}>
          <li>Engagement is purely on contract basis and does not confer any right for regular appointment in NPC.</li>
          <li>Remuneration is determined per AI-858/2026 Annex-II matrices based on qualification and experience.</li>
          <li>Candidates scoring &gt;80% in Selection Committee evaluation get maximum remuneration; 60-80% get 90% of maximum.</li>
          <li>Contractual employees are entitled to 12 days leave per year on pro-rata basis.</li>
          <li>NPC reserves the right to cancel or withdraw any advertisement without assigning reason.</li>
        </ul>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const icons: Record<string, string> = {
    briefcase: '\uD83D\uDCBC', location: '\uD83D\uDCCD', clock: '\u23F0',
    money: '\uD83D\uDCB0', graduation: '\uD83C\uDF93', calendar: '\uD83D\uDCC5',
    user: '\uD83D\uDC64', folder: '\uD83D\uDCC2',
  };
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoIcon}>{icons[icon] || ''}</span>
      <div>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
  loadingBox: { textAlign: 'center', padding: '48px', color: '#888' },
  pageHeader: { textAlign: 'center', marginBottom: '28px' },
  pageTitle: { margin: '0 0 4px', fontSize: '1.6rem', color: '#1a237e' },
  pageSubtitle: { margin: '0 0 4px', fontSize: '1rem', color: '#555' },
  aiRef: { margin: 0, fontSize: '0.8rem', color: '#999', fontStyle: 'italic' },
  searchBar: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' as const },
  searchInput: {
    flex: 1, minWidth: 'min(100%, 250px)', padding: '10px 16px', border: '1px solid #ccc',
    borderRadius: '6px', fontSize: '0.95rem', outline: 'none',
  },
  resultCount: { fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap' as const },
  emptyState: { textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' },
  jobList: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  jobCard: {
    background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px',
    padding: '20px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s',
  },
  badgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '8px' },
  badgeType: {
    background: '#e8eaf6', color: '#283593', padding: '3px 10px',
    borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
  },
  badgePosts: {
    background: '#e0f2f1', color: '#00695c', padding: '3px 10px',
    borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
  },
  badgeUrgent: {
    background: '#ffebee', color: '#c62828', padding: '3px 10px',
    borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
  },
  jobTitle: { margin: '0 0 2px', fontSize: '1.15rem', color: '#1a237e' },
  advertNo: { margin: '0 0 12px', fontSize: '0.8rem', color: '#999' },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
    gap: '10px', margin: '12px 0',
  },
  infoItem: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  infoIcon: { fontSize: '1rem', lineHeight: '1.4' },
  infoLabel: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  infoValue: { fontSize: '0.9rem', color: '#333', fontWeight: 500 },
  roleDesc: { margin: '8px 0', fontSize: '0.9rem', color: '#555', lineHeight: '1.5', borderLeft: '3px solid #e8eaf6', paddingLeft: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' as const, gap: '12px' },
  deadline: { fontSize: '0.85rem', fontWeight: 500 },
  cardActions: { display: 'flex', gap: '8px' },
  viewBtn: {
    padding: '8px 16px', border: '1px solid #1a237e', color: '#1a237e',
    borderRadius: '5px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
  },
  applyBtn: {
    padding: '8px 20px', background: '#1a237e', color: '#fff',
    borderRadius: '5px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
  },
  infoBox: {
    marginTop: '32px', padding: '16px 20px', background: '#fffde7',
    border: '1px solid #fff9c4', borderRadius: '8px',
  },
};
