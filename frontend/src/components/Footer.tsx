/**
 * Professional footer for NPC government portal.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        {/* Column 1: Quick Links */}
        <div style={S.col}>
          <h4 style={S.colTitle}>Quick Links</h4>
          <Link to="/" style={S.link}>Home</Link>
          <Link to="/adverts" style={S.link}>Open Positions</Link>
          <Link to="/apply/empanelment" style={S.link}>Apply for Empanelment</Link>
          <Link to="/register" style={S.link}>Register / Login</Link>
          <a href="https://npcindia.gov.in" target="_blank" rel="noopener noreferrer" style={S.link}>NPC Official Website</a>
        </div>

        {/* Column 2: Contact */}
        <div style={S.col}>
          <h4 style={S.colTitle}>Contact Us</h4>
          <p style={S.text}>National Productivity Council</p>
          <p style={S.text}>5-6 Institutional Area, Lodi Road</p>
          <p style={S.text}>New Delhi - 110003</p>
          <p style={S.text}>Phone: 011-24690331</p>
          <p style={S.text}>Email: info@npcindia.gov.in</p>
        </div>

        {/* Column 3: Important */}
        <div style={S.col}>
          <h4 style={S.colTitle}>Important</h4>
          <a href="https://npcindia.gov.in/NPC/User/rti" target="_blank" rel="noopener noreferrer" style={S.link}>RTI (Right to Information)</a>
          <a href="https://pgportal.gov.in/" target="_blank" rel="noopener noreferrer" style={S.link}>Grievance Redressal</a>
          <Link to="/" style={S.link}>Privacy Policy</Link>
          <Link to="/" style={S.link}>Terms & Conditions</Link>
          <Link to="/" style={S.link}>Accessibility Statement</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={S.bottom}>
        <p style={S.bottomText}>
          &copy; {new Date().getFullYear()} National Productivity Council | Under DPIIT, Ministry of Commerce &amp; Industry, Government of India
        </p>
        <p style={{ ...S.bottomText, fontSize: '0.7rem', marginTop: 4, opacity: 0.7 }}>
          All rights reserved. Content on this portal is for informational purposes and governed by AI-858/2026.
        </p>
      </div>
    </footer>
  );
}

const S: Record<string, React.CSSProperties> = {
  footer: {
    background: '#1a237e',
    color: '#fff',
    padding: 0,
    marginTop: 'auto',
  },
  inner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: 24,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px 24px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  colTitle: {
    margin: '0 0 8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    borderBottom: '2px solid rgba(255,255,255,0.3)',
    paddingBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    lineHeight: 1.6,
  },
  text: {
    margin: 0,
    fontSize: '0.85rem',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.85)',
  },
  bottom: {
    textAlign: 'center' as const,
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.15)',
  },
  bottomText: {
    margin: 0,
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.8)',
  },
};
