/**
 * Contractual application controller.
 * Handles application against adverts with auto-screening per AI-858/2026.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import * as contractualService from '../services/contractual.service';
import * as empanelmentService from '../services/empanelment.service';
import * as profileService from '../services/profile.service';

const createApplicationSchema = z.object({
  profileId: z.string().uuid(),
  advertId: z.string().uuid(),
});

/**
 * POST /applications/contractual
 * Creates contractual application and runs auto-screening against advert criteria.
 */
export async function createApplication(req: Request, res: Response) {
  try {
    const input = createApplicationSchema.parse(req.body);
    const result = await contractualService.createContractualApplication(input);
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
 * POST /applications/contractual/full
 * Creates profile (or updates) then submits contractual application.
 * Accepts full inline profile + advertId.
 */
export async function createFullApplication(req: Request, res: Response) {
  try {
    const { profile: profileData, advertId, empanelmentOptIn } = req.body;

    if (!profileData || !advertId) {
      res.status(400).json({ success: false, error: 'Missing required fields: profile, advertId.' });
      return;
    }

    const userId = req.user!.userId;

    // Step 1: Create or update profile
    const profile = await profileService.upsertProfile(userId, profileData);

    // Step 2: Submit contractual application
    const result = await contractualService.createContractualApplication({
      profileId: profile.id,
      advertId,
    });

    // Step 3: If applicant opted for empanelment, create empanelment application too
    let empanelmentResult = null;
    if (empanelmentOptIn && empanelmentOptIn.domainId && empanelmentOptIn.empanelmentArea && empanelmentOptIn.officePreferenceIds?.length) {
      try {
        empanelmentResult = await empanelmentService.createEmpanelmentApplication({
          profileId: profile.id,
          domainId: empanelmentOptIn.domainId,
          subDomainId: empanelmentOptIn.subDomainId,
          empanelmentArea: empanelmentOptIn.empanelmentArea,
          officePreferenceIds: empanelmentOptIn.officePreferenceIds,
        });
      } catch (empErr: any) {
        // Don't fail the contractual application if empanelment fails (e.g., already empaneled)
        console.warn('Empanelment opt-in failed:', empErr.message);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...result,
        empanelmentResult: empanelmentResult ? { submitted: true, screeningResult: empanelmentResult.screeningResult } : null,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * GET /applications/contractual/:id
 */
export async function getApplication(req: Request, res: Response) {
  try {
    const application = await contractualService.getContractualApplication(req.params.id);
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
 * GET /applications/contractual/my/:profileId
 */
export async function getMyApplications(req: Request, res: Response) {
  try {
    const applications = await contractualService.getApplicantContractualApplications(req.params.profileId);
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /committee/screening/contractual/:advertId/pending
 * AI-858 Annex-I §4 — Screening Committee shortlists.
 */
export async function getScreeningPending(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await contractualService.getContractualPendingForScreening(
      req.params.advertId,
      page,
      pageSize
    );
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
