/**
 * Profile controller.
 * Handles applicant profile CRUD and document uploads.
 */

import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';

/**
 * POST /profile — create or update the authenticated user's profile.
 * Accepts JSON body with profile data. Photo upload handled separately.
 */
export async function upsertProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const photoFile = req.file; // from multer (optional)
    const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : undefined;

    const profile = await profileService.upsertProfile(userId, req.body, photoUrl);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * GET /profile — get the authenticated user's profile.
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getProfileByUserId(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /profile/documents — upload a document for the user's profile.
 * Expects multipart form data with field "file" and query param "type".
 */
export async function uploadDocument(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getProfileByUserId(userId);
    if (!profile) {
      res.status(400).json({ success: false, error: 'Profile must be created first.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const documentType = (req.body.documentType as string) || 'other';
    const doc = await profileService.addDocument(
      profile.id,
      documentType,
      req.file.originalname,
      `/uploads/${req.file.filename}`
    );
    res.json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}
