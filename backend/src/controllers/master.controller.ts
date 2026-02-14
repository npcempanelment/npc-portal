/**
 * Master data controller — domains, offices, adverts.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import * as masterService from '../services/master.service';
import { ContractualDesignation, EngagementType } from '../types/enums';

const createAdvertSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  requisitionType: z.enum(['PROJECT', 'ADMIN_FINANCE', 'NEW_PROJECT_IDEAS']),
  projectName: z.string().optional(),
  projectValue: z.number().optional(),
  domainId: z.string().optional(),
  officeId: z.string().optional(),
  designation: z.nativeEnum(ContractualDesignation),
  engagementType: z.nativeEnum(EngagementType),
  numberOfPosts: z.number().int().min(1),
  placeOfDeployment: z.string().optional(),
  functionalRole: z.string().optional(),
  workResponsibilities: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  minQualification: z.string().optional(),
  qualificationDetails: z.string().optional(),
  minExperienceYears: z.number().optional(),
  maxAge: z.number().int().optional(),
  specificRequirements: z.string().optional(),
  desirableSkills: z.string().optional(),
  remunerationMin: z.number().optional(),
  remunerationMax: z.number().optional(),
  remunerationBasis: z.string().optional(),
  remunerationNote: z.string().optional(),
  contractPeriodMonths: z.number().int().optional(),
  contractStartDate: z.string().optional(),
  termsAndConditions: z.string().optional(),
  workingHoursNote: z.string().optional(),
  travelRequired: z.boolean().optional(),
  travelNote: z.string().optional(),
  lastDateToApply: z.string().optional(),
  applicationEmail: z.string().optional(),
  generalConditions: z.string().optional(),
});

export async function getDomains(_req: Request, res: Response) {
  try {
    const domains = await masterService.getDomains();
    res.json({ success: true, data: domains });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSubDomains(req: Request, res: Response) {
  try {
    const subDomains = await masterService.getSubDomains(req.params.domainId);
    res.json({ success: true, data: subDomains });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOffices(_req: Request, res: Response) {
  try {
    const offices = await masterService.getOffices();
    res.json({ success: true, data: offices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPublishedAdverts(_req: Request, res: Response) {
  try {
    const adverts = await masterService.getPublishedAdverts();
    res.json({ success: true, data: adverts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAdvertById(req: Request, res: Response) {
  try {
    const advert = await masterService.getAdvertById(req.params.id);
    if (!advert) {
      res.status(404).json({ success: false, error: 'Advertisement not found.' });
      return;
    }
    res.json({ success: true, data: advert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllAdverts(_req: Request, res: Response) {
  try {
    const adverts = await masterService.getAllAdverts();
    res.json({ success: true, data: adverts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createAdvert(req: Request, res: Response) {
  try {
    const input = createAdvertSchema.parse(req.body);
    const advert = await masterService.createAdvert(
      {
        ...input,
        domainId: input.domainId || undefined,
        officeId: input.officeId || undefined,
        contractStartDate: input.contractStartDate ? new Date(input.contractStartDate) : undefined,
        lastDateToApply: input.lastDateToApply ? new Date(input.lastDateToApply) : undefined,
      },
      req.user!.userId
    );
    res.status(201).json({ success: true, data: advert });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed.', details: error.errors });
      return;
    }
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function publishAdvert(req: Request, res: Response) {
  try {
    const advert = await masterService.publishAdvert(req.params.id);
    res.json({ success: true, data: advert });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}
