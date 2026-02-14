/**
 * Admin page — eligibility rules and remuneration matrix viewer.
 */

import React, { useState } from 'react';
import { AI_858_DESIGNATIONS } from '../data/remunerationData';

export default function AdminEligibilityPage() {
  const [tab, setTab] = useState<'empanelment' | 'contractual'>('empanelment');

  return (
    <div style={styles.container}>
      <h2>Eligibility Rules &amp; Remuneration</h2>
      <p style={styles.subtitle}>
        Auto-screening criteria per Empanelment AI §4 and AI-858/2026 Annexure II.
      </p>

      <div style={styles.tabs}>
        <button onClick={() => setTab('empanelment')}
          style={{ ...styles.tab, ...(tab === 'empanelment' ? styles.tabActive : {}) }}>
          Empanelment Categories
        </button>
        <button onClick={() => setTab('contractual')}
          style={{ ...styles.tab, ...(tab === 'contractual' ? styles.tabActive : {}) }}>
          Contractual Designations (AI-858)
        </button>
      </div>

      {tab === 'empanelment' && <EmpanelmentRules />}
      {tab === 'contractual' && <ContractualRules />}
    </div>
  );
}

function EmpanelmentRules() {
  const categories = [
    { name: 'Advisor', exp: '25+ years', groupA: '15+ years at Level 12+', qual: 'Post-graduation', age: '70', salary: 'As per govt norms' },
    { name: 'Senior Consultant', exp: '15+ years', groupA: '10+ years Group A', qual: 'Post-graduation', age: '65', salary: 'As per govt norms' },
    { name: 'Consultant', exp: '10+ years', groupA: '5+ years Group A', qual: 'Post-graduation', age: '60', salary: 'As per govt norms' },
    { name: 'Project Associate', exp: '3+ years', groupA: '-', qual: 'Graduate', age: '45', salary: 'As per govt norms' },
    { name: 'Young Professional', exp: '0-2 years', groupA: '-', qual: 'Post-graduation / Doctorate', age: '35', salary: 'As per govt norms' },
  ];

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Category</th>
          <th style={styles.th}>Min Experience</th>
          <th style={styles.th}>Govt Service</th>
          <th style={styles.th}>Qualification</th>
          <th style={styles.th}>Max Age</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((c, i) => (
          <tr key={c.name} style={i % 2 === 0 ? {} : { background: '#f9f9f9' }}>
            <td style={styles.td}><strong>{c.name}</strong></td>
            <td style={styles.td}>{c.exp}</td>
            <td style={styles.td}>{c.groupA}</td>
            <td style={styles.td}>{c.qual}</td>
            <td style={styles.td}>{c.age} yrs</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ContractualRules() {
  return (
    <div>
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px' }}>Annexure II-A (Support to Young Professional)</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Sl</th>
            <th style={styles.th}>Designation</th>
            <th style={styles.th}>Min Qualification</th>
            <th style={styles.th}>Max Age</th>
            <th style={styles.th}>Remuneration Range</th>
          </tr>
        </thead>
        <tbody>
          {AI_858_DESIGNATIONS.filter(d => d.annexure === 'II-A').map((d, i) => (
            <tr key={d.value} style={i % 2 === 0 ? {} : { background: '#f9f9f9' }}>
              <td style={styles.td}>{d.slNo}</td>
              <td style={styles.td}><strong>{d.label}</strong></td>
              <td style={styles.td}>{d.minQualification}</td>
              <td style={styles.td}>{d.maxAge} yrs</td>
              <td style={styles.td}>
                {d.salaryByExperience
                  ? (() => {
                      const vals = Object.values(d.salaryByExperience);
                      return `₹${(Math.min(...vals) / 1000).toFixed(0)}K - ₹${(Math.max(...vals) / 1000).toFixed(0)}K/month`;
                    })()
                  : d.remunerationNote || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontSize: '1rem', margin: '20px 0 12px' }}>Annexure II-B (Consultant to Senior Advisor)</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Sl</th>
            <th style={styles.th}>Designation</th>
            <th style={styles.th}>Min Qualification</th>
            <th style={styles.th}>Max Age</th>
            <th style={styles.th}>Monthly Rate</th>
            <th style={styles.th}>Daily Rate</th>
          </tr>
        </thead>
        <tbody>
          {AI_858_DESIGNATIONS.filter(d => d.annexure === 'II-B').map((d, i) => (
            <tr key={d.value} style={i % 2 === 0 ? {} : { background: '#f9f9f9' }}>
              <td style={styles.td}>{d.slNo}</td>
              <td style={styles.td}><strong>{d.label}</strong></td>
              <td style={styles.td}>{d.minQualification}</td>
              <td style={styles.td}>{d.maxAge} yrs</td>
              <td style={styles.td}>
                {d.fixedMonthlyTiers?.[0]
                  ? `₹${(d.fixedMonthlyTiers[0].monthlyAmount / 1000).toFixed(0)}K`
                  : d.remunerationNote || '-'}
              </td>
              <td style={styles.td}>
                {d.fixedMonthlyTiers?.[0]?.dailyAmount
                  ? `₹${(d.fixedMonthlyTiers[0].dailyAmount / 1000).toFixed(0)}K`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1000, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: {
    padding: '8px 20px', border: '1px solid #ccc', borderRadius: 6,
    background: '#fff', cursor: 'pointer', fontSize: '0.9rem',
  },
  tabActive: { background: '#1a237e', color: '#fff', borderColor: '#1a237e' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12 },
  th: { textAlign: 'left', padding: '10px 14px', background: '#1a237e', color: '#fff', fontSize: '0.8rem' },
  td: { padding: '8px 14px', borderBottom: '1px solid #eee', fontSize: '0.85rem' },
};
