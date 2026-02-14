/**
 * Root application component with routing.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import Header from './components/Header';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 80px)', background: '#f5f5f5' }}>
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
            <Route path="/admin/domains" element={<AdminDomainsPage />} />
            <Route path="/admin/offices" element={<AdminOfficesPage />} />
            <Route path="/admin/committees" element={<AdminCommitteesPage />} />
            <Route path="/admin/eligibility" element={<AdminEligibilityPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/letters" element={<AdminLettersPage />} />
            <Route path="/admin/public-list" element={<AdminPublicListPage />} />

            {/* Catch-all */}
            <Route path="*" element={<div style={{ padding: '48px', textAlign: 'center' }}><h2>Page Not Found</h2></div>} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '0.8rem', background: '#fff', borderTop: '1px solid #eee' }}>
          National Productivity Council | Under DPIIT, Ministry of Commerce & Industry, Govt of India
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
