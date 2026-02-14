/**
 * Root application component with routing.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmpanelmentApplicationPage from './pages/EmpanelmentApplicationPage';
import AdvertsPage from './pages/AdvertsPage';
import ContractualApplicationPage from './pages/ContractualApplicationPage';
import ScreeningDashboardPage from './pages/ScreeningDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdvertDetailPage from './pages/AdvertDetailPage';
import AdminAdvertFormPage from './pages/AdminAdvertFormPage';
import AdminAdvertsPage from './pages/AdminAdvertsPage';
import AdminDomainsPage from './pages/AdminDomainsPage';
import AdminOfficesPage from './pages/AdminOfficesPage';
import AdminCommitteesPage from './pages/AdminCommitteesPage';
import AdminEligibilityPage from './pages/AdminEligibilityPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminLettersPage from './pages/AdminLettersPage';
import AdminPublicListPage from './pages/AdminPublicListPage';
import ProfilePage from './pages/ProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';

function NotFoundPage() {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: '4rem', color: '#1a237e', margin: '0 0 8px' }}>404</h1>
      <h2 style={{ color: '#333', margin: '0 0 16px' }}>Page Not Found</h2>
      <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: 24 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={{ padding: '10px 24px', background: '#1a237e', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem' }}>
          Go to Home
        </Link>
        <Link to="/adverts" style={{ padding: '10px 24px', background: '#fff', color: '#1a237e', border: '1px solid #1a237e', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem' }}>
          Browse Positions
        </Link>
        <Link to="/dashboard" style={{ padding: '10px 24px', background: '#fff', color: '#1a237e', border: '1px solid #1a237e', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem' }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header />
        <main id="main-content" style={{ minHeight: 'calc(100vh - 80px)', background: '#f5f5f5' }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/adverts" element={<AdvertsPage />} />
            <Route path="/adverts/:id" element={<AdvertDetailPage />} />

            {/* Applicant */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/apply/empanelment" element={<EmpanelmentApplicationPage />} />
            <Route path="/apply/contractual/:advertId" element={<ContractualApplicationPage />} />

            {/* Committee */}
            <Route path="/committee" element={<ScreeningDashboardPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/adverts" element={<AdminAdvertsPage />} />
            <Route path="/admin/adverts/new" element={<AdminAdvertFormPage />} />
            <Route path="/admin/adverts/:id/edit" element={<AdminAdvertFormPage />} />
            <Route path="/admin/domains" element={<AdminDomainsPage />} />
            <Route path="/admin/offices" element={<AdminOfficesPage />} />
            <Route path="/admin/committees" element={<AdminCommitteesPage />} />
            <Route path="/admin/eligibility" element={<AdminEligibilityPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/letters" element={<AdminLettersPage />} />
            <Route path="/admin/public-list" element={<AdminPublicListPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
