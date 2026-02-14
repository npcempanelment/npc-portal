/**
 * Component test for Footer.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

describe('Footer', () => {
  function renderFooter() {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  }

  it('should render the copyright text', () => {
    renderFooter();
    const matches = screen.getAllByText(/National Productivity Council/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('should render Quick Links section', () => {
    renderFooter();
    expect(screen.getByText('Quick Links')).toBeTruthy();
  });

  it('should render Contact Us section', () => {
    renderFooter();
    expect(screen.getByText('Contact Us')).toBeTruthy();
  });

  it('should render Important section', () => {
    renderFooter();
    expect(screen.getByText('Important')).toBeTruthy();
  });

  it('should contain link to NPC website', () => {
    renderFooter();
    const npcLink = screen.getByText('NPC Official Website');
    expect(npcLink).toBeTruthy();
    expect(npcLink.getAttribute('href')).toBe('https://npcindia.gov.in');
  });

  it('should contain contact information', () => {
    renderFooter();
    expect(screen.getByText(/011-24690331/)).toBeTruthy();
    expect(screen.getByText(/info@npcindia.gov.in/)).toBeTruthy();
  });

  it('should contain navigation links', () => {
    renderFooter();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Open Positions')).toBeTruthy();
    expect(screen.getByText('Apply for Empanelment')).toBeTruthy();
  });

  it('should contain current year in copyright', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    const matches = screen.getAllByText(new RegExp(year));
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
