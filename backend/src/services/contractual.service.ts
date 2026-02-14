/**
 * Contractual Application service.
 *
 * Handles creation, auto-screening, and management of contractual applications
 * linked to specific advertisements per AI-858/2026.
 */

import { PrismaClient, ApplicationStatus as PrismaAppStatus } from '@prisma/client';
import { screenForContractual, AdvertCriteria } from './auto-screening';
import {
  IApplicantProfile,
  IContractualApplicationCreate,
  ApplicationStatus,
} from '../types';
import { ContractualDesignation } from '../types/enums';

const prisma = new PrismaClient();

/**
 * Create a contractual application against a specific advert.
 * Runs auto-screening per AI-858 Annex-II-A/B.
 */
export async function createContractualApplication(input: IContractualApplicationCreate) {
  // Fetch applicant profile
  const profile = await prisma.applicantProfile.findUnique({
    where: { id: input.profileId },
    include: { educations: true, experiences: true },
  });
  if (!profile) throw new Error('Applicant profile not found.');

  // Fetch advert
  const advert = await prisma.advert.findUnique({ where: { id: input.advertId } });
  if (!advert) throw new Error('Advertisement not found.');
  if (advert.status !== 'PUBLISHED') throw new Error('Advertisement is not open for applications.');

  // Check if already applied
  const existing = await prisma.contractualApplication.findFirst({
    where: { profileId: input.profileId, advertId: input.advertId },
  });
  if (existing) throw new Error('You have already applied for this advertisement.');

  // Build profile data
  const profileData: IApplicantProfile = {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    backgroundType: profile.backgroundType as IApplicantProfile['backgroundType'],
    contactNumbers: profile.contactNumbers,
    educations: profile.educations.map((e) => ({
      degree: e.degree,
      field: e.field,
      institution: e.institution,
      university: e.university ?? undefined,
      yearOfPassing: e.yearOfPassing,
      grade: e.grade ?? undefined,
      isPremierInstitute: e.isPremierInstitute,
      isDoctorate: e.isDoctorate,
      isPostGraduation: e.isPostGraduation,
    })),
    experiences: profile.experiences.map((e) => ({
      organization: e.organization,
      designation: e.designation,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      isGroupAService: e.isGroupAService,
      payLevel: e.payLevel ?? undefined,
      isLevel12OrAbove: e.isLevel12OrAbove,
    })),
  };

  // Build advert criteria for screening
  const criteria: AdvertCriteria = {
    designation: advert.designation as ContractualDesignation,
    minQualification: advert.minQualification ?? undefined,
    minExperienceYears: advert.minExperienceYears ?? undefined,
    maxAge: advert.maxAge ?? undefined,
  };

  // Run auto-screening — Rule from AI-858 Annex-II-A/B
  const screenResult = screenForContractual(profileData, criteria);

  const application = await prisma.contractualApplication.create({
    data: {
      profileId: input.profileId,
      advertId: input.advertId,
      autoScreenEligible: screenResult.eligible,
      autoScreenReasons: screenResult.reasons,
      computedTotalExpYears: screenResult.computedValues.totalExperienceYears,
      computedAge: screenResult.computedValues.age,
      meetsQualification: screenResult.meetsQualification,
      meetsExperience: screenResult.meetsExperience,
      meetsAge: screenResult.meetsAge,
      suggestedRemunerationMin: screenResult.suggestedRemunerationBand?.min ?? null,
      suggestedRemunerationMax: screenResult.suggestedRemunerationBand?.max ?? null,
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
    },
    include: { advert: true },
  });

  return { application, screeningResult: screenResult };
}

/**
 * Get contractual application by ID.
 */
export async function getContractualApplication(id: string) {
  return prisma.contractualApplication.findUnique({
    where: { id },
    include: {
      profile: {
        include: { educations: true, experiences: true, user: { select: { email: true, name: true } } },
      },
      advert: true,
      screeningDecision: true,
      evaluationScores: true,
      engagementOrder: true,
    },
  });
}

/**
 * Get contractual applications for a specific applicant.
 */
export async function getApplicantContractualApplications(profileId: string) {
  return prisma.contractualApplication.findMany({
    where: { profileId },
    include: {
      advert: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get pending contractual applications for Screening Committee.
 * AI-858 Annex-I §4: Screening Committee shortlists eligible candidates.
 */
export async function getContractualPendingForScreening(advertId: string, page = 1, pageSize = 20) {
  const where = {
    advertId,
    status: { in: [PrismaAppStatus.SUBMITTED, PrismaAppStatus.AUTO_SCREENED] },
  };

  const [applications, total] = await Promise.all([
    prisma.contractualApplication.findMany({
      where,
      include: {
        profile: {
          include: { user: { select: { email: true, name: true } } },
        },
        advert: true,
      },
      orderBy: { submittedAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contractualApplication.count({ where }),
  ]);

  return { applications, total, page, pageSize };
}
