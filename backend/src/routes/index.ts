/**
 * API route definitions for NPC Portal.
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';
import { upload } from '../middleware/upload';

import * as authCtrl from '../controllers/auth.controller';
import * as profileCtrl from '../controllers/profile.controller';
import * as empanelmentCtrl from '../controllers/empanelment.controller';
import * as contractualCtrl from '../controllers/contractual.controller';
import * as masterCtrl from '../controllers/master.controller';
import * as reportsCtrl from '../controllers/reports.controller';

const router = Router();

// ── Auth (public) ──
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);

// ── Profile management ──
router.get('/profile', authenticate, profileCtrl.getProfile);
router.post('/profile', authenticate, upload.single('photo'), profileCtrl.upsertProfile);
router.post('/profile/documents', authenticate, upload.single('file'), profileCtrl.uploadDocument);

// ── Master data (public read, admin write) ──
router.get('/master/domains', masterCtrl.getDomains);
router.get('/master/domains/:domainId/subdomains', masterCtrl.getSubDomains);
router.get('/master/offices', masterCtrl.getOffices);
router.get('/master/adverts/published', masterCtrl.getPublishedAdverts);
router.get('/master/adverts/:id', masterCtrl.getAdvertById);

// ── Admin: adverts management ──
router.get('/admin/adverts', authenticate, authorize(UserRole.ADMIN, UserRole.DG), masterCtrl.getAllAdverts);
router.post('/admin/adverts', authenticate, authorize(UserRole.ADMIN), masterCtrl.createAdvert);
router.put('/admin/adverts/:id', authenticate, authorize(UserRole.ADMIN), masterCtrl.updateAdvert);
router.post('/admin/adverts/:id/publish', authenticate, authorize(UserRole.ADMIN), masterCtrl.publishAdvert);

// ── Admin: reports ──
router.get('/admin/reports/stats', authenticate, authorize(UserRole.ADMIN, UserRole.DG), reportsCtrl.getStats);
router.get('/admin/reports/contractual-applications', authenticate, authorize(UserRole.ADMIN, UserRole.DG), reportsCtrl.getContractualApplicationsReport);
router.get('/admin/reports/empanelment-applications', authenticate, authorize(UserRole.ADMIN, UserRole.DG), reportsCtrl.getEmpanelmentApplicationsReport);

// ── Empanelment applications (with inline profile) ──
router.post('/applications/empanelment', authenticate, authorize(UserRole.APPLICANT), empanelmentCtrl.createApplication);
router.post('/applications/empanelment/full', authenticate, empanelmentCtrl.createFullApplication);
router.get('/applications/empanelment/:id', authenticate, empanelmentCtrl.getApplication);
router.get('/applications/empanelment/my/:profileId', authenticate, authorize(UserRole.APPLICANT), empanelmentCtrl.getMyApplications);

// ── Contractual applications (with inline profile) ──
router.post('/applications/contractual', authenticate, authorize(UserRole.APPLICANT), contractualCtrl.createApplication);
router.post('/applications/contractual/full', authenticate, contractualCtrl.createFullApplication);
router.get('/applications/contractual/my/:profileId', authenticate, authorize(UserRole.APPLICANT), contractualCtrl.getMyApplications);
router.get('/applications/contractual/:id', authenticate, contractualCtrl.getApplication);

// ── Committee: Screening (empanelment) — Empanelment AI §2.2 ──
router.get(
  '/committee/screening/empanelment/pending',
  authenticate,
  authorize(UserRole.SCREENING_MEMBER, UserRole.ADMIN),
  empanelmentCtrl.getScreeningPending
);
router.post(
  '/committee/screening/empanelment/:id/decision',
  authenticate,
  authorize(UserRole.SCREENING_MEMBER),
  empanelmentCtrl.submitScreeningDecision
);

// ── Committee: Empanelment — Empanelment AI §3.2 ──
router.get(
  '/committee/empanelment/pending',
  authenticate,
  authorize(UserRole.EMPANELMENT_MEMBER, UserRole.ADMIN),
  empanelmentCtrl.getEmpanelmentCommitteePending
);

// ── Committee: Screening (contractual) — AI-858 Annex-I §4 ──
router.get(
  '/committee/screening/contractual/:advertId/pending',
  authenticate,
  authorize(UserRole.SCREENING_MEMBER, UserRole.ADMIN),
  contractualCtrl.getScreeningPending
);

export default router;
