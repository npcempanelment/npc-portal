/**
 * Public Landing Page — NPC Empanelment & Engagement Portal.
 *
 * Promotional + engagement-focused page with:
 * - Hero banner with NPC mission
 * - Two engagement pathways (Empanelment vs Contractual)
 * - Remuneration tables from AI-858 (collapsible)
 * - Key terms (full-time vs part-time)
 * - Domains grid
 * - Final CTA
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AI_858_DESIGNATIONS } from '../data/remunerationData';

const DOMAINS = [
  { name: 'Information Technology', desc: 'Digital transformation, software, cybersecurity, data analytics' },
  { name: 'Industrial Engineering', desc: 'Process optimization, lean manufacturing, productivity improvement' },
  { name: 'Agri-Business', desc: 'Agri value chain, food processing, rural enterprise development' },
  { name: 'Economic Services', desc: 'Productivity research, economic analysis, policy advisory' },
  { name: 'Energy Management', desc: 'Energy audit, renewable energy, energy efficiency' },
  { name: 'Environment & Climate Action', desc: 'Environmental impact, sustainability, climate resilience' },
  { name: 'Human Resource Management', desc: 'HR systems, training design, organizational development' },
  { name: 'Quality Management', desc: 'Quality systems, ISO standards, Six Sigma, TQM' },
  { name: 'Technology Management', desc: 'Technology transfer, innovation management, R&D advisory' },
];

const EMPANELMENT_CATEGORIES = [
  { category: 'Advisor', eligibility: '20+ years in Group-A (10 yrs Level 12/13+) OR Doctorate + 25 yrs professional standing' },
  { category: 'Senior Consultant', eligibility: '13+ years (5 yrs in Level 12) OR PG + 13 yrs professional standing' },
  { category: 'Consultant', eligibility: '6–13 years experience with Post Graduation / Engineering degree' },
  { category: 'Project Associate', eligibility: '0–6 years experience with Post Graduation / Engineering degree' },
  { category: 'Young Professional', eligibility: 'Professional degree from premier institute (IIT/IIM/ISI etc.), max age 35' },
];

const annexIIA = AI_858_DESIGNATIONS.filter(d => d.annexure === 'II-A' && d.salaryByExperience);
const annexIIB = AI_858_DESIGNATIONS.filter(d => d.annexure === 'II-B');

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

export default function HomePage() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  function togglePanel(id: string) {
    setExpandedPanel(prev => prev === id ? null : id);
  }

  return (
    <div>
      {/* ═══ SECTION 1: Hero Banner ═══ */}
      <section style={S.hero}>
        <div style={S.heroInner}>
          <h1 style={S.heroTitle}>Empanelment & Engagement Portal</h1>
          <p style={S.heroDesc}>
            Join India's premier productivity organization. NPC invites qualified professionals to
            contribute their expertise — either through continuous empanelment as domain experts
            or through contractual engagement against specific project requirements.
          </p>
          <div style={S.heroBtns}>
            <Link to="/apply/empanelment" style={S.heroBtn}>Apply for Empanelment</Link>
            <Link to="/adverts" style={S.heroBtnOutline}>View Open Positions</Link>
          </div>
        </div>
      </section>

      <div style={S.container}>
        {/* ═══ SECTION 2: Two Engagement Pathways ═══ */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>How to Engage with NPC</h2>
          <p style={S.sectionDesc}>
            NPC offers two distinct pathways for professionals to contribute their expertise.
            Choose the pathway that matches your availability and career goals.
          </p>

          <div style={S.pathwayGrid}>
            {/* Empanelment Card */}
            <div style={S.pathwayCard}>
              <div style={S.pathwayHeader}>
                <span style={S.badge}>Always Open</span>
                <h3 style={S.pathwayTitle}>Empanelment of External Experts</h3>
              </div>
              <p style={S.pathwayDesc}>
                Get pre-qualified and empaneled in NPC's expert pool. Once empaneled, you can be
                engaged on <strong>short notice</strong> for specific assignments <strong>without fresh
                application procedures</strong>. Empanelment is valid for <strong>3 years</strong>.
              </p>

              <h4 style={S.subHead}>Categories & Eligibility</h4>
              <table style={S.miniTable}>
                <thead>
                  <tr><th style={S.miniTh}>Category</th><th style={S.miniTh}>Eligibility</th></tr>
                </thead>
                <tbody>
                  {EMPANELMENT_CATEGORIES.map(c => (
                    <tr key={c.category}>
                      <td style={{ ...S.miniTd, fontWeight: 600, whiteSpace: 'nowrap' }}>{c.category}</td>
                      <td style={S.miniTd}>{c.eligibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={S.subHead}>Empanelment Areas</h4>
              <ul style={S.compactList}>
                <li>Consultancy / Action Research Services</li>
                <li>Training & Capacity Building Services</li>
                <li>Both Consultancy & Training</li>
              </ul>

              <h4 style={S.subHead}>Process</h4>
              <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 12px' }}>
                Apply online (continuous) &rarr; Screening Committee verifies eligibility &rarr;
                Empanelment Committee conducts interview &rarr; DG approval &rarr; Empanelment letter issued
              </p>

              <Link to="/apply/empanelment" style={S.ctaBtn}>Apply for Empanelment</Link>
            </div>

            {/* Contractual Card */}
            <div style={S.pathwayCard}>
              <div style={S.pathwayHeader}>
                <span style={{ ...S.badge, background: '#e65100' }}>Apply Against Adverts</span>
                <h3 style={S.pathwayTitle}>Contractual Engagement</h3>
              </div>
              <p style={S.pathwayDesc}>
                Apply against specific advertisements for project-based or operational positions.
                Engagement terms and remuneration are governed by <strong>AI-858/2026</strong>.
                Auto-screening evaluates your eligibility against the advert criteria.
              </p>

              <div style={S.twoCol}>
                <div style={S.subCard}>
                  <h4 style={{ ...S.subHead, color: '#2e7d32' }}>Full-Time Engagement</h4>
                  <ul style={S.compactList}>
                    <li>Consolidated monthly remuneration</li>
                    <li>Normal office timings apply</li>
                    <li>12 days leave per year (pro-rata)</li>
                    <li>Annual performance review</li>
                    <li>TA/DA as per mapped Govt. Pay Level</li>
                  </ul>
                </div>
                <div style={S.subCard}>
                  <h4 style={{ ...S.subHead, color: '#e65100' }}>Part-Time Engagement</h4>
                  <ul style={S.compactList}>
                    <li>Per-day remuneration basis</li>
                    <li>Office timing NOT applicable</li>
                    <li>Leave provisions NOT applicable</li>
                    <li>Max 15 days/month, 90 days/year</li>
                    <li>TA/DA as per mapped Govt. Pay Level</li>
                  </ul>
                </div>
              </div>

              <h4 style={S.subHead}>Types of Engagement</h4>
              <ul style={S.compactList}>
                <li><strong>Full-time / Part-time</strong> — Consolidated monthly or per-day basis</li>
                <li><strong>Lump Sum</strong> — Milestone-based delivery within defined period</li>
                <li><strong>Revenue Sharing</strong> — Success fee for bringing new projects (max 3%)</li>
                <li><strong>Resource Person</strong> — Sessions in training programmes (Rs 4,500–12,000/session)</li>
              </ul>

              <Link to="/adverts" style={S.ctaBtn}>View Open Positions</Link>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: Remuneration Tables (Collapsible) ═══ */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Remuneration Structure (AI-858/2026)</h2>
          <p style={S.sectionDesc}>
            Remuneration for contractual engagement is determined as per the matrices below.
            Candidates scoring above 80% in evaluation receive the maximum amount; those scoring
            60–80% receive 90% of the maximum.
          </p>

          {/* Panel A: Annexure II-A */}
          <div style={S.accordion}>
            <button type="button" onClick={() => togglePanel('IIA')} style={S.accordionBtn}>
              <div>
                <strong>Annexure II-A: Support Staff to Young Professional</strong>
                <div style={S.accordionSummary}>Rs 25,000 – Rs 70,000/month based on designation and experience (0–5 years)</div>
              </div>
              <span style={S.arrow}>{expandedPanel === 'IIA' ? '▲' : '▼'}</span>
            </button>
            {expandedPanel === 'IIA' && (
              <div style={S.accordionBody}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHeadRow}>
                        <th style={S.th}>Sl.</th>
                        <th style={S.th}>Designation</th>
                        <th style={S.th}>Min. Qualification</th>
                        <th style={S.thNum}>0 yr</th>
                        <th style={S.thNum}>1 yr</th>
                        <th style={S.thNum}>2 yrs</th>
                        <th style={S.thNum}>3 yrs</th>
                        <th style={S.thNum}>4 yrs</th>
                        <th style={S.thNum}>5 yrs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annexIIA.map(d => (
                        <tr key={d.value}>
                          <td style={S.td}>{d.slNo}</td>
                          <td style={{ ...S.td, fontWeight: 500 }}>{d.label}</td>
                          <td style={{ ...S.td, fontSize: '0.8rem', maxWidth: 200 }}>{d.minQualification}</td>
                          {[0,1,2,3,4,5].map(yr => (
                            <td key={yr} style={S.tdNum}>
                              {d.salaryByExperience?.[yr] ? fmt(d.salaryByExperience[yr]) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={S.tableNote}>
                  * Young Professional: Rs 60,000 fixed, max tenure 3 years, age limit 35 years.
                  <br />* Support Executive: As per minimum wages, preferably from manpower agency.
                  <br />* Amounts shown are maximum permissible remuneration (Rs/month).
                </p>
              </div>
            )}
          </div>

          {/* Panel B: Annexure II-B */}
          <div style={S.accordion}>
            <button type="button" onClick={() => togglePanel('IIB')} style={S.accordionBtn}>
              <div>
                <strong>Annexure II-B: Consultant to Senior Advisor</strong>
                <div style={S.accordionSummary}>Rs 75,000 – Rs 1,50,000/month (or Rs 5,000 – Rs 12,000/day for part-time)</div>
              </div>
              <span style={S.arrow}>{expandedPanel === 'IIB' ? '▲' : '▼'}</span>
            </button>
            {expandedPanel === 'IIB' && (
              <div style={S.accordionBody}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHeadRow}>
                        <th style={S.th}>Sl.</th>
                        <th style={S.th}>Designation</th>
                        <th style={S.th}>Min. Qualification</th>
                        <th style={S.th}>Experience</th>
                        <th style={S.thNum}>Monthly (Rs)</th>
                        <th style={S.thNum}>Daily (Rs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annexIIB.map(d => {
                        if (!d.fixedMonthlyTiers?.length) {
                          return (
                            <tr key={d.value}>
                              <td style={S.td}>{d.slNo}</td>
                              <td style={{ ...S.td, fontWeight: 500 }}>{d.label}</td>
                              <td style={{ ...S.td, fontSize: '0.8rem' }}>{d.minQualification}</td>
                              <td style={S.td}>—</td>
                              <td style={S.tdNum} colSpan={2}>{d.remunerationNote || '—'}</td>
                            </tr>
                          );
                        }
                        return d.fixedMonthlyTiers.map((tier, ti) => (
                          <tr key={`${d.value}-${ti}`}>
                            {ti === 0 && (
                              <>
                                <td style={S.td} rowSpan={d.fixedMonthlyTiers!.length}>{d.slNo}</td>
                                <td style={{ ...S.td, fontWeight: 500 }} rowSpan={d.fixedMonthlyTiers!.length}>{d.label}</td>
                                <td style={{ ...S.td, fontSize: '0.8rem' }} rowSpan={d.fixedMonthlyTiers!.length}>{d.minQualification}</td>
                              </>
                            )}
                            <td style={S.td}>{tier.label}</td>
                            <td style={S.tdNum}>{fmt(tier.monthlyAmount)}</td>
                            <td style={S.tdNum}>{tier.dailyAmount ? fmt(tier.dailyAmount) : '—'}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
                <p style={S.tableNote}>
                  * Max age 65 years for all categories.
                  <br />* Part-time daily engagement: Subject to max 15 days/month, not more than 90 days/year.
                  <br />* Expert (Retired): 50% of last Basic Pay + current DA, fixed thereafter.
                  <br />* Senior Advisor (GoI retired): Remuneration as per Ministry of Finance applicable rules.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ═══ SECTION 4: Key Terms ═══ */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Key Terms of Engagement</h2>
          <p style={S.sectionDesc}>
            All engagements are governed by AI-858/2026. Terms vary based on whether the
            engagement is full-time or part-time. When engaged through empanelment or application,
            the pay structure and engagement terms & conditions apply as per AI-858.
          </p>

          <div style={S.termsGrid}>
            <div style={{ ...S.termsCard, borderTop: '4px solid #2e7d32' }}>
              <h4 style={{ color: '#2e7d32', marginTop: 0 }}>Full-Time Engagement</h4>
              <ul style={S.termsList}>
                <li>Consolidated monthly remuneration (all-inclusive)</li>
                <li>Normal office timings apply; may be called beyond office hours</li>
                <li>12 days leave per year on pro-rata basis (no carry-forward)</li>
                <li>Annual performance review by Group Head / Regional Director</li>
                <li>TA/DA as per mapped Government Pay Level (7th CPC)</li>
                <li>Redesignation as "Senior" after 6 years (subject to satisfactory performance)</li>
              </ul>
            </div>
            <div style={{ ...S.termsCard, borderTop: '4px solid #e65100' }}>
              <h4 style={{ color: '#e65100', marginTop: 0 }}>Part-Time Engagement</h4>
              <ul style={S.termsList}>
                <li>Per-day remuneration for actual days of engagement</li>
                <li>Office timing provisions NOT applicable</li>
                <li>Leave provisions NOT applicable</li>
                <li>Max 15 days per month, 90 days per year</li>
                <li>TA/DA as per mapped Government Pay Level (7th CPC)</li>
                <li>Periodic performance review</li>
              </ul>
            </div>
          </div>

          <div style={S.commonTerms}>
            <h4 style={{ marginTop: 0, color: '#333' }}>Common Terms (All Engagements)</h4>
            <ul style={S.termsList}>
              <li>Purely contractual — no right to regularization, absorption, or permanent appointment in NPC</li>
              <li>All intellectual property created during engagement belongs to NPC</li>
              <li>Subject to Indian Official Secrets Act, 1923 and NPC cyber security/IT policy</li>
              <li>Police verification required; adverse report leads to termination</li>
              <li>30 days written notice required for exit; NPC may terminate without notice for cause</li>
              <li>Original documents verified at time of joining</li>
              <li>Decision of Director General, NPC is final in all matters</li>
            </ul>
          </div>
        </section>

        {/* ═══ SECTION 5: Domains ═══ */}
        <section style={S.section}>
          <h2 style={S.sectionTitle}>Domains of Expertise</h2>
          <p style={S.sectionDesc}>
            NPC works across the following domains. Experts can apply for empanelment or contractual
            engagement in their area of specialization.
          </p>
          <div style={S.domainGrid}>
            {DOMAINS.map(d => (
              <div key={d.name} style={S.domainCard}>
                <h4 style={S.domainName}>{d.name}</h4>
                <p style={S.domainDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 6: Final CTA ═══ */}
        <section style={S.ctaStrip}>
          <h3 style={{ margin: '0 0 8px', color: '#1a237e' }}>Ready to work with NPC?</h3>
          <p style={{ margin: '0 0 16px', color: '#555', fontSize: '0.95rem' }}>
            Join India's premier productivity organization as an external expert or contractual professional.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/apply/empanelment" style={S.ctaBtn}>Apply for Empanelment</Link>
            <Link to="/adverts" style={{ ...S.ctaBtn, background: '#e65100' }}>View Open Positions</Link>
            <Link to="/register" style={{ ...S.ctaBtn, background: '#fff', color: '#1a237e', border: '2px solid #1a237e' }}>Register / Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Styles ──

const S: Record<string, React.CSSProperties> = {
  // Hero
  hero: { background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)', color: '#fff', padding: '48px 24px 40px', textAlign: 'center' },
  heroInner: { maxWidth: 900, margin: '0 auto' },
  heroTitle: { fontSize: '2rem', margin: '0 0 4px', fontWeight: 700, letterSpacing: '0.5px' },
  heroSubtitle: { fontSize: '0.9rem', opacity: 0.8, margin: '0 0 20px' },
  heroHeadline: { fontSize: '1.5rem', margin: '0 0 16px', fontWeight: 400 },
  heroDesc: { fontSize: '1rem', lineHeight: 1.7, maxWidth: 750, margin: '0 auto 24px', opacity: 0.92 },
  heroBtns: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  heroBtn: { display: 'inline-block', padding: '12px 28px', background: '#fff', color: '#1a237e', textDecoration: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.95rem' },
  heroBtnOutline: { display: 'inline-block', padding: '12px 28px', background: 'transparent', color: '#fff', textDecoration: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.95rem', border: '2px solid rgba(255,255,255,0.7)' },

  // Layout
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' },
  section: { marginTop: 40 },
  sectionTitle: { color: '#1a237e', fontSize: '1.5rem', marginBottom: 8, textAlign: 'center' },
  sectionDesc: { color: '#666', fontSize: '0.95rem', textAlign: 'center', maxWidth: 750, margin: '0 auto 24px', lineHeight: 1.6 },

  // Pathways
  pathwayGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 },
  pathwayCard: { border: '1px solid #ddd', borderRadius: 10, padding: 24, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  pathwayHeader: { marginBottom: 12 },
  pathwayTitle: { margin: '8px 0 0', color: '#1a237e', fontSize: '1.15rem' },
  pathwayDesc: { fontSize: '0.9rem', color: '#444', lineHeight: 1.6, marginBottom: 12 },
  badge: { display: 'inline-block', background: '#2e7d32', color: '#fff', padding: '3px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const },
  subHead: { fontSize: '0.9rem', color: '#1a237e', margin: '14px 0 6px', fontWeight: 600 },

  // Mini table (empanelment categories)
  miniTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 12 },
  miniTh: { padding: '6px 8px', background: '#e8eaf6', textAlign: 'left', borderBottom: '2px solid #c5cae9', fontSize: '0.8rem' },
  miniTd: { padding: '5px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top' },

  // Sub card (full-time vs part-time)
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  subCard: { background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 6, padding: 12 },
  compactList: { paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 8px' },

  // CTA button
  ctaBtn: { display: 'inline-block', padding: '10px 24px', background: '#1a237e', color: '#fff', textDecoration: 'none', borderRadius: 5, fontWeight: 600, fontSize: '0.9rem', marginTop: 8 },

  // Accordion (remuneration)
  accordion: { border: '1px solid #ddd', borderRadius: 8, marginBottom: 12, background: '#fff', overflow: 'hidden' },
  accordionBtn: { width: '100%', padding: '14px 18px', background: '#f5f5f5', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' },
  accordionSummary: { fontSize: '0.82rem', color: '#666', marginTop: 2 },
  arrow: { fontSize: '0.8rem', color: '#888', marginLeft: 12 },
  accordionBody: { padding: '16px 18px', borderTop: '1px solid #eee' },

  // Remuneration table
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  tableHeadRow: { background: '#e8eaf6' },
  th: { padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #c5cae9', fontWeight: 600, fontSize: '0.8rem' },
  thNum: { padding: '8px 10px', textAlign: 'right', borderBottom: '2px solid #c5cae9', fontWeight: 600, fontSize: '0.8rem' },
  td: { padding: '6px 10px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  tdNum: { padding: '6px 10px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'monospace' },
  tableNote: { fontSize: '0.78rem', color: '#888', marginTop: 10, lineHeight: 1.6 },

  // Terms
  termsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  termsCard: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 20 },
  termsList: { paddingLeft: 18, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 },
  commonTerms: { background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },

  // Domains
  domainGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  domainCard: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 16, textAlign: 'center' },
  domainName: { margin: '0 0 4px', color: '#1a237e', fontSize: '0.95rem' },
  domainDesc: { margin: 0, fontSize: '0.82rem', color: '#666', lineHeight: 1.5 },

  // Final CTA
  ctaStrip: { textAlign: 'center', padding: '32px 24px', background: '#e8eaf6', borderRadius: 10, marginTop: 40 },
};
