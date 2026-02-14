/**
 * Empanelment Application service.
 *
 * Handles creation, auto-screening, and retrieval of empanelment applications.
 * Integrates with the auto-screening engine per Empanelment AI Section 2.3.
 */

import { PrismaClient, ApplicationStatus as PrismaAppStatus } from '@prisma/client';
import { screenForEmpanelment } from './auto-screening';
import {
  IEmpanelmentApplicationCreate,
  IApplicantProfile,
  ApplicationStatus,
} from '../types';

const prisma = new PrismaClient();

/**
 * Create a new empanelment application, run auto-screening, and store results.
 * Rule from Empanelment AI Section 2.3 — auto-classify applicant category.
 */
export async function createEmpanelmentApplication(input: IEmpanelmentApplicationCreate) {
  // Fetch full applicant profile with education and experience
  const profile = await prisma.applicantProfile.findUnique({
    where: { id: input.profileId },
    include: { educations: true, experiences: true },
  });

  if (!profile) {
    throw new Error('Applicant profile not found.');
  }

  // Build the profile interface for screening
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

  // Run auto-screening
  const screenResult = screenForEmpanelment(profileData);

  // Create application with auto-screening results
  const application = await prisma.empanelmentApplication.create({
    data: {
      profileId: input.profileId,
      domainId: input.domainId,
      subDomainId: input.subDomainId,
      empanelmentArea: input.empanelmentArea,
      autoScreenCategory: screenResult.provisionalCategory,
      autoScreenEligible: screenResult.eligible,
      autoScreenReasons: screenResult.reasons,
      computedTotalExpYears: screenResult.computedValues.totalExperienceYears,
      computedGroupAYears: screenResult.computedValues.groupAServiceYears,
      computedLevel12Years: screenResult.computedValues.level12PlusYears,
      computedAge: screenResult.computedValues.age,
      hasDoctorate: screenResult.computedValues.hasDoctorate,
      hasPostGrad: screenResult.computedValues.hasPostGrad,
      hasRelevantDegree: screenResult.computedValues.hasPostGrad || screenResult.computedValues.hasPremierDegree,
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
      // Office preferences
      officePreferences: {
        create: input.officePreferenceIds.map((officeId, idx) => ({
          officeId,
          preferenceOrder: idx + 1,
        })),
      },
    },
    include: {
      domain: true,
      subDomain: true,
      officePreferences: { include: { office: true }, orderBy: { preferenceOrder: 'asc' } },
    },
  });

  return {
    application,
    screeningResult: screenResult,
  };
}

/**
 * Get empanelment application by ID.
 */
export async function getEmpanelmentApplication(id: string) {
  return prisma.empanelmentApplication.findUnique({
    where: { id },
    include: {
      profile: {
        include: { educations: true, experiences: true, user: { select: { email: true, name: true } } },
      },
      domain: true,
      subDomain: true,
      officePreferences: { include: { office: true }, orderBy: { preferenceOrder: 'asc' } },
      screeningDecision: true,
      evaluationScores: true,
      empanelmentRecord: true,
    },
  });
}

/**
 * Get all empanelment applications for Screening Committee review.
 * Empanelment AI §2.2 — Screening Committee reviews monthly.
 * Returns applications in SUBMITTED/AUTO_SCREENED status.
 */
export async function getPendingForScreening(page = 1, pageSize = 20) {
  const where = {
    status: { in: [PrismaAppStatus.SUBMITTED, PrismaAppStatus.AUTO_SCREENED] },
  };

  const [applications, total] = await Promise.all([
    prisma.empanelmentApplication.findMany({
      where,
      include: {
        profile: {
          include: { user: { select: { email: true, name: true } } },
        },
        domain: true,
        subDomain: true,
      },
      orderBy: { submittedAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.empanelmentApplication.count({ where }),
  ]);

  return { applications, total, page, pageSize };
}

/**
 * Get pending empanelment applications for Empanelment Committee.
 * Empanelment AI §3.2 — after Screening Committee approval.
 */
export async function getPendingForEmpanelmentCommittee(page = 1, pageSize = 20) {
  const where = {
    status: PrismaAppStatus.SCREENING_APPROVED,
  };

  const [applications, total] = await Promise.all([
    prisma.empanelmentApplication.findMany({
      where,
      include: {
        profile: {
          include: { educations: true, experiences: true, user: { select: { email: true, name: true } } },
        },
        domain: true,
        subDomain: true,
        screeningDecision: true,
      },
      orderBy: { submittedAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.empanelmentApplication.count({ where }),
  ]);

  return { applications, total, page, pageSize };
}

/**
 * Record Screening Committee decision on an empanelment application.
 * Empanelment AI §2.2 — validate eligibility and domain/level categorisation.
 */
export async function recordScreeningDecision(
  applicationId: string,
  decision: 'APPROVED' | 'REJECTED' | 'REFERRED_BACK',
  confirmedCategory: string | undefined,
  remarks: string | undefined,
  meetingId: string,
  decidedByUserId: string
) {
  const newStatus =
    decision === 'APPROVED'
      ? ApplicationStatus.SCREENING_APPROVED
      : decision === 'REJECTED'
        ? ApplicationStatus.SCREENING_REJECTED
        : ApplicationStatus.SCREENING_PENDING;

  const [screeningDecision, updatedApplication] = await prisma.$transaction([
    prisma.screeningDecision.create({
      data: {
        empanelmentApplicationId: applicationId,
        meetingId,
        decidedByUserId,
        decision,
        confirmedCategory: confirmedCategory as any,
        remarks,
      },
    }),
    prisma.empanelmentApplication.update({
      where: { id: applicationId },
      data: { status: newStatus },
    }),
  ]);

  return { screeningDecision, updatedApplication };
}

/**
 * Get applications for a specific applicant.
 */
export async function getApplicantEmpanelmentApplications(profileId: string) {
  return prisma.empanelmentApplication.findMany({
    where: { profileId },
    include: {
      domain: true,
      subDomain: true,
      officePreferences: { include: { office: true } },
      empanelmentRecord: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
