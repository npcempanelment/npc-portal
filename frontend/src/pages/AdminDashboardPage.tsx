/**
 * Admin dashboard — masters management, advert configuration.
 * For Administration Group per Empanelment AI §3.3 and AI-858 SOP.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div style={styles.container}>
      <h2>Administration Dashboard</h2>
      <p style={styles.subtitle}>
        Administration Group — Empanelment AI §3.3 & AI-858/2026 SOP
      </p>

      <div style={styles.grid}>
        <AdminCard
          title="Domains & Sub-Domains"
          description="Configure competency domains and sub-domains for empanelment."
          linkTo="/admin/domains"
        />
        <AdminCard
          title="NPC Offices"
          description="Manage NPC office locations and regional directorates."
          linkTo="/admin/offices"
        />
        <AdminCard
          title="Advertisements"
          description="Create, publish, and manage contractual engagement adverts."
          linkTo="/admin/adverts"
        />
        <AdminCard
          title="Committees"
          description="Constitute Screening and Empanelment Committees with DG approval."
          linkTo="/admin/committees"
        />
        <AdminCard
          title="Eligibility Rules"
          description="View and configure eligibility criteria and remuneration matrices."
          linkTo="/admin/eligibility"
        />
        <AdminCard
          title="Reports"
          description="View empanelment statistics, pending applications, and engagement orders."
          linkTo="/admin/reports"
        />
        <AdminCard
          title="Issue Letters"
          description="Generate empanelment letters and engagement orders after DG approval."
          linkTo="/admin/letters"
        />
        <AdminCard
          title="Public Empanelment List"
          description="Update empaneled experts list on NPC website (quarterly)."
          linkTo="/admin/public-list"
        />
      </div>
    </div>
  );
}

function AdminCard({ title, description, linkTo }: { title: string; description: string; linkTo: string }) {
  return (
    <Link to={linkTo} style={styles.card}>
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>{description}</p>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
  subtitle: { color: '#666', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  card: {
    display: 'block',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    textDecoration: 'none',
    color: '#333',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
};
