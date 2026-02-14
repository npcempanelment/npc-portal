/**
 * Full advertisement detail page — replaces PDF download.
 * Shows all structured information from AI-858 Annex-A template:
 * role, eligibility, experience, remuneration, terms, conditions.
 * Visitors can read everything online without downloading anything.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdvertById } from '../services/api';
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
  FULL_TIME: 'Full-Time (Consolidated Monthly)',
  PART_TIME: 'Part-Time (Per Day Basis)',
  LUMP_SUM: 'Lump Sum (Milestone-Based)',
  REVENUE_SHARE: 'Revenue Sharing Basis',
  RESOURCE_PERSON: 'Resource Person',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

/** Renders text with newlines as paragraphs or list items */
function RichText({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim());
  const isBulletList = lines.every(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().startsWith('\u2022'));

  if (isBulletList) {
    return (
      <ul style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.7' }}>
        {lines.map((line, i) => (
          <li key={i} style={{ fontSize: '0.9rem' }}>{line.replace(/^[-*\u2022]\s*/, '')}</li>
        ))}
      </ul>
    );
  }

  return (
    <div style={{ lineHeight: '1.7' }}>
      {lines.map((line, i) => (
        <p key={i} style={{ margin: '4px 0', fontSize: '0.9rem' }}>{line}</p>
      ))}
    </div>
  );
}

export default function AdvertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getAdvertById(id)
        .then(setAdvert)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={styles.container}><p style={{ textAlign: 'center', padding: '48px' }}>Loading advertisement details...</p></div>;
  if (!advert) return <div style={styles.container}><p style={{ textAlign: 'center', padding: '48px' }}>Advertisement not found.</p></div>;

  const daysLeft = advert.lastDateToApply
    ? Math.max(0, Math.ceil((new Date(advert.lastDateToApply).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div style={styles.container}>
      {/* Back link */}
      <Link to="/adverts" style={styles.backLink}>&larr; Back to all openings</Link>

      {/* Header card */}
      <div style={styles.headerCard}>
        <div style={styles.orgInfo}>
          <h3 style={{ margin: '0 0 2px', color: '#1a237e' }}>National Productivity Council</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
            Under DPIIT, Ministry of Commerce & Industry, Govt. of India
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
            5-6 Institutional Area, Lodhi Road, New Delhi - 110003
          </p>
        </div>
        <div style={styles.advertMeta}>
          <span style={styles.advertNumber}>{advert.advertNumber}</span>
          {advert.publishDate && (
            <span style={styles.publishDate}>
              Published: {new Date(advert.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Title section */}
      <div style={styles.titleSection}>
        <h2 style={styles.mainTitle}>{advert.title}</h2>
        {advert.description && <p style={styles.description}>{advert.description}</p>}
      </div>

      {/* Key details summary bar */}
      <div style={styles.summaryBar}>
        <SummaryItem label="Designation" value={DESIGNATION_LABELS[advert.designation] || advert.designation} />
        <SummaryItem label="Engagement" value={ENGAGEMENT_LABELS[advert.engagementType] || advert.engagementType} />
        <SummaryItem label="Vacancies" value={String(advert.numberOfPosts)} />
        {advert.contractPeriodMonths && <SummaryItem label="Duration" value={`${advert.contractPeriodMonths} months`} />}
        <SummaryItem
          label="Location"
          value={advert.placeOfDeployment || advert.office?.name || 'NPC HQ, New Delhi'}
        />
      </div>

      {/* Main content sections */}
      <div style={styles.sections}>
        {/* Eligibility & Qualification */}
        <Section title="Eligibility Criteria">
          <table style={styles.detailTable}>
            <tbody>
              {advert.minQualification && (
                <DetailRow label="Minimum Qualification" value={advert.minQualification} />
              )}
              {advert.qualificationDetails && (
                <DetailRow label="Qualification Details" value={advert.qualificationDetails} rich />
              )}
              {advert.minExperienceYears != null && (
                <DetailRow label="Minimum Experience" value={`${advert.minExperienceYears} years of relevant experience`} />
              )}
              {advert.maxAge != null && (
                <DetailRow label="Maximum Age" value={`${advert.maxAge} years as on date of application`} />
              )}
              {advert.specificRequirements && (
                <DetailRow label="Specific Requirements" value={advert.specificRequirements} rich />
              )}
              {advert.desirableSkills && (
                <DetailRow label="Desirable Skills" value={advert.desirableSkills} rich />
              )}
            </tbody>
          </table>
          {advert.eligibilityCriteria && (
            <div style={styles.richBlock}>
              <RichText text={advert.eligibilityCriteria} />
            </div>
          )}
        </Section>

        {/* Role & Responsibilities */}
        {(advert.functionalRole || advert.workResponsibilities) && (
          <Section title="Role & Responsibilities">
            {advert.functionalRole && (
              <div style={styles.roleBox}>
                <strong>Functional Role:</strong> {advert.functionalRole}
              </div>
            )}
            {advert.workResponsibilities && (
              <div style={styles.richBlock}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Work Responsibilities:</strong>
                <RichText text={advert.workResponsibilities} />
              </div>
            )}
          </Section>
        )}

        {/* Remuneration */}
        <Section title="Remuneration">
          <div style={styles.remunerationBox}>
            {advert.remunerationMax && (
              <div style={styles.salaryHighlight}>
                {advert.remunerationMin && advert.remunerationMin !== advert.remunerationMax
                  ? `${formatCurrency(advert.remunerationMin)} - ${formatCurrency(advert.remunerationMax)}`
                  : `Up to ${formatCurrency(advert.remunerationMax)}`
                }
                <span style={styles.salaryBasis}>
                  / {advert.remunerationBasis === 'DAILY' ? 'day' : 'month'}
                </span>
              </div>
            )}
            {advert.remunerationNote && (
              <p style={styles.remunerationNote}>{advert.remunerationNote}</p>
            )}
            <div style={styles.remunerationInfo}>
              <p>As per AI-858/2026:</p>
              <ul>
                <li>Candidates scoring &gt;80% in Selection Committee evaluation receive maximum remuneration.</li>
                <li>Candidates scoring 60-80% receive 90% of the maximum amount.</li>
                <li>No allowances such as DA, overtime, transport, accommodation, or medical reimbursement.</li>
                <li>Income tax deducted at source as per Government rules.</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Terms & Conditions */}
        <Section title="Terms & Conditions">
          {advert.termsAndConditions ? (
            <RichText text={advert.termsAndConditions} />
          ) : (
            <ul style={styles.termsList}>
              <li>Engagement is purely on contract basis and does not confer any right for regular appointment in NPC or its associated organizations.</li>
              <li>The contractual person shall not be entitled to benefits/compensation/absorption/regularization under Industrial Disputes Act, 1947 or Contract Labour Act, 1970.</li>
              <li>
                {advert.workingHoursNote || 'Normal office timings apply. May be called beyond office hours including holidays for official work.'}
              </li>
              {advert.travelRequired && (
                <li>
                  Travel may be required. {advert.travelNote || 'TA/DA as per NPC rules mapped to equivalent Government Pay Level.'}
                </li>
              )}
              <li>Leave entitlement: 12 days per year on pro-rata basis. Un-availed leave cannot be carried forward.</li>
              <li>Performance reviewed annually (full-time) or quarterly (lump-sum). Continuation subject to satisfactory performance.</li>
              <li>Either party may terminate: NPC without notice for unsatisfactory performance; contractual person with 30 days written notice.</li>
              <li>Original documents and certificates must be produced at the time of joining.</li>
            </ul>
          )}
        </Section>

        {/* General Conditions */}
        <Section title="General Conditions">
          {advert.generalConditions ? (
            <RichText text={advert.generalConditions} />
          ) : (
            <ul style={styles.termsList}>
              <li>If performance is not satisfactory, NPC may terminate the contract at any time without notice and without assigning any reason.</li>
              <li>Original documents required at joining, failing which the offer stands withdrawn.</li>
              <li>NPC reserves the right to cancel or withdraw this advertisement at any time without assigning reason.</li>
              <li>All intellectual property created during engagement belongs to NPC.</li>
              <li>Subject to police verification; adverse report leads to immediate termination.</li>
              <li>Decision of Director General, NPC is final and binding in all matters.</li>
            </ul>
          )}
        </Section>

        {/* How to Apply */}
        <Section title="How to Apply">
          <div style={styles.howToApply}>
            <p style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>
              Apply online through this portal by clicking the button below. Alternatively, submit your application
              {advert.applicationEmail ? ` via email to ${advert.applicationEmail}` : ' through the NPC empanelment portal'}
              {advert.lastDateToApply && ` on or before ${new Date(advert.lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} by 3:00 PM`}.
            </p>
            {daysLeft !== null && (
              <p style={{ margin: '0 0 16px', fontWeight: 'bold', color: daysLeft <= 5 ? '#c62828' : '#2e7d32', fontSize: '0.95rem' }}>
                {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining to apply` : 'Application deadline has passed'}
              </p>
            )}
            <Link to={`/apply/contractual/${advert.id}`} style={styles.bigApplyBtn}>
              Apply for this Position
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryValue}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, rich }: { label: string; value: string; rich?: boolean }) {
  return (
    <tr>
      <td style={styles.dtLabel}>{label}</td>
      <td style={styles.dtValue}>
        {rich ? <RichText text={value} /> : value}
      </td>
    </tr>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
  backLink: { display: 'inline-block', marginBottom: '16px', color: '#1a237e', textDecoration: 'none', fontSize: '0.9rem' },
  headerCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    background: '#1a237e', color: '#fff', borderRadius: '10px 10px 0 0',
    padding: '16px 24px', flexWrap: 'wrap' as const, gap: '8px',
  },
  orgInfo: {},
  advertMeta: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' },
  advertNumber: { fontSize: '0.8rem', opacity: 0.9 },
  publishDate: { fontSize: '0.75rem', opacity: 0.8 },
  titleSection: { background: '#fff', padding: '20px 24px', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' },
  mainTitle: { margin: '0 0 8px', fontSize: '1.3rem', color: '#1a237e' },
  description: { margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: '1.6' },
  summaryBar: {
    display: 'flex', flexWrap: 'wrap' as const, background: '#e8eaf6',
    padding: '12px 24px', gap: '20px',
    borderLeft: '1px solid #c5cae9', borderRight: '1px solid #c5cae9',
  },
  summaryItem: { flex: '1 0 140px' },
  summaryLabel: { fontSize: '0.7rem', color: '#5c6bc0', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '2px' },
  summaryValue: { fontSize: '0.9rem', fontWeight: 600, color: '#283593' },
  sections: {
    background: '#fff', border: '1px solid #e0e0e0', borderTop: 'none',
    borderRadius: '0 0 10px 10px', padding: '0 24px 24px',
  },
  section: { borderBottom: '1px solid #f0f0f0', padding: '20px 0' },
  sectionTitle: { margin: '0 0 12px', fontSize: '1.05rem', color: '#1a237e', borderBottom: '2px solid #e8eaf6', paddingBottom: '6px' },
  detailTable: { width: '100%', borderCollapse: 'collapse' as const },
  dtLabel: { padding: '8px 12px 8px 0', fontWeight: 600, fontSize: '0.9rem', color: '#555', verticalAlign: 'top', width: '200px', borderBottom: '1px solid #f5f5f5' },
  dtValue: { padding: '8px 0', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #f5f5f5' },
  richBlock: { margin: '8px 0', padding: '12px 16px', background: '#fafafa', borderRadius: '4px', border: '1px solid #f0f0f0' },
  roleBox: { fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '12px' },
  remunerationBox: {},
  salaryHighlight: { fontSize: '1.4rem', fontWeight: 700, color: '#2e7d32', margin: '0 0 8px' },
  salaryBasis: { fontSize: '0.9rem', fontWeight: 400, color: '#666' },
  remunerationNote: { fontSize: '0.85rem', color: '#666', margin: '4px 0 12px', fontStyle: 'italic' },
  remunerationInfo: { fontSize: '0.85rem', color: '#555', lineHeight: '1.8', background: '#f5f5f5', padding: '12px 16px', borderRadius: '4px' },
  termsList: { paddingLeft: '20px', margin: '0', lineHeight: '1.8', fontSize: '0.9rem' },
  howToApply: { textAlign: 'center' as const, padding: '12px 0' },
  bigApplyBtn: {
    display: 'inline-block', padding: '14px 40px', background: '#1a237e', color: '#fff',
    borderRadius: '6px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
    boxShadow: '0 2px 8px rgba(26,35,126,0.3)',
  },
};
