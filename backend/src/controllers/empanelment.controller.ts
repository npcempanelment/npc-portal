/**
 * Empanelment application controller.
 * Handles application creation (with auto-screening) and committee workflows.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import * as empanelmentService from '../services/empanelment.service';
import * as profileService from '../services/profile.service';
import { EmpanelmentArea } from '../types/enums';

const createApplicationSchema = z.object({
  profileId: z.string().uuid(),
  domainId: z.string().uuid(),
  subDomainId: z.string().uuid().optional(),
  empanelmentArea: z.nativeEnum(EmpanelmentArea),
  officePreferenceIds: z.array(z.string().uuid()).min(1).max(5),
});

const screeningDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'REFERRED_BACK']),
  confirmedCategory: z.string().optional(),
  remarks: z.string().optional(),
  meetingId: z.string().uuid(),
});

/**
 * POST /applications/empanelment
 * Creates empanelment application and runs auto-screening.
 */
export async function createApplication(req: Request, res: Response) {
  try {
    const input = createApplicationSchema.parse(req.body);
    const result = await empanelmentService.createEmpanelmentApplication(input);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
      return;
    }
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * POST /applications/empanelment/full
 * Creates profile (or updates) then submits empanelment application.
 * Accepts full inline profile + application data.
 */
export async function createFullApplication(req: Request, res: Response) {
  try {
    const { profile: profileData, domainId, subDomainId, empanelmentArea, officePreferenceIds } = req.body;

    if (!profileData || !domainId || !empanelmentArea || !officePreferenceIds?.length) {
      res.status(400).json({ success: false, error: 'Missing required fields: profile, domainId, empanelmentArea, officePreferenceIds.' });
      return;
    }

    const userId = req.user!.userId;

    // Step 1: Create or update profile
    const profile = await profileService.upsertProfile(userId, profileData);

    // Step 2: Submit empanelment application
    const result = await empanelmentService.createEmpanelmentApplication({
      profileId: profile.id,
      domainId,
      subDomainId,
      empanelmentArea,
      officePreferenceIds,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * GET /applications/empanelment/:id
 */
export async function getApplication(req: Request, res: Response) {
  try {
    const application = await empanelmentService.getEmpanelmentApplication(req.params.id);
    if (!application) {
      res.status(404).json({ success: false, error: 'Application not found.' });
      return;
    }
    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /applications/empanelment/my/:profileId
 */
export async function getMyApplications(req: Request, res: Response) {
  try {
    const applications = await empanelmentService.getApplicantEmpanelmentApplications(req.params.profileId);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /committee/screening/empanelment/pending
 * Empanelment AI §2.2 — Screening Committee monthly review.
 */
export async function getScreeningPending(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await empanelmentService.getPendingForScreening(page, pageSize);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /committee/screening/empanelment/:id/decision
 * Empanelment AI §2.2 — Screening Committee validates and categorises.
 */
export async function submitScreeningDecision(req: Request, res: Response) {
  try {
    const input = screeningDecisionSchema.parse(req.body);
    const result = await empanelmentService.recordScreeningDecision(
      req.params.id,
      input.decision,
      input.confirmedCategory,
      input.remarks,
      input.meetingId,
      req.user!.userId
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
      return;
    }
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * GET /committee/empanelment/pending
 * Empanelment AI §3.2 — Empanelment Committee reviews screening-approved candidates.
 */
export async function getEmpanelmentCommitteePending(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await empanelmentService.getPendingForEmpanelmentCommittee(page, pageSize);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
