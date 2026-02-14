/**
 * Applicant Profile service.
 * Handles create/update of profiles with education, experience,
 * certifications, and document references.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProfileInput {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  fatherOrMotherOrSpouseName?: string;
  backgroundType: string;
  correspondenceAddress?: string;
  permanentAddress?: string;
  contactNumbers?: string[];
  aadhaarNumber?: string;
  panNumber?: string;
  lastOrganization?: string;
  lastDesignation?: string;
  lastPayLevel?: string;
  retirementDate?: string;
  ppoNumber?: string;
  educations: {
    degree: string;
    field: string;
    institution: string;
    university?: string;
    yearOfPassing: number;
    grade?: string;
    isPremierInstitute?: boolean;
    isDoctorate?: boolean;
    isPostGraduation?: boolean;
  }[];
  experiences: {
    organization: string;
    designation: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    isGroupAService?: boolean;
    payLevel?: string;
    isLevel12OrAbove?: boolean;
    payBandOrRemuneration?: string;
    dutiesDescription?: string;
  }[];
  certifications?: {
    name: string;
    issuingBody: string;
    yearObtained?: number;
    certificateNumber?: string;
  }[];
}

/**
 * Create or update an applicant profile for the given user.
 * If the user already has a profile, update it (and replace education/experience/certifications).
 */
export async function upsertProfile(userId: string, input: ProfileInput, photoUrl?: string) {
  const existing = await prisma.applicantProfile.findUnique({
    where: { userId },
    include: { educations: true, experiences: true, certifications: true },
  });

  if (existing) {
    // Delete old child records before replacing
    await prisma.$transaction([
      prisma.education.deleteMany({ where: { profileId: existing.id } }),
      prisma.experience.deleteMany({ where: { profileId: existing.id } }),
      prisma.certification.deleteMany({ where: { profileId: existing.id } }),
    ]);

    const profile = await prisma.applicantProfile.update({
      where: { userId },
      data: {
        fullName: input.fullName,
        dateOfBirth: new Date(input.dateOfBirth),
        gender: input.gender,
        fatherOrMotherOrSpouseName: input.fatherOrMotherOrSpouseName,
        backgroundType: input.backgroundType as any,
        correspondenceAddress: input.correspondenceAddress,
        permanentAddress: input.permanentAddress,
        contactNumbers: input.contactNumbers || [],
        aadhaarNumber: input.aadhaarNumber,
        panNumber: input.panNumber,
        lastOrganization: input.lastOrganization,
        lastDesignation: input.lastDesignation,
        lastPayLevel: input.lastPayLevel,
        retirementDate: input.retirementDate ? new Date(input.retirementDate) : null,
        ppoNumber: input.ppoNumber,
        photoUrl: photoUrl || existing.photoUrl,
        educations: {
          create: input.educations.map(e => ({
            degree: e.degree,
            field: e.field,
            institution: e.institution,
            university: e.university,
            yearOfPassing: e.yearOfPassing,
            grade: e.grade,
            isPremierInstitute: e.isPremierInstitute ?? false,
            isDoctorate: e.isDoctorate ?? false,
            isPostGraduation: e.isPostGraduation ?? false,
          })),
        },
        experiences: {
          create: input.experiences.map(e => ({
            organization: e.organization,
            designation: e.designation,
            startDate: new Date(e.startDate),
            endDate: e.endDate ? new Date(e.endDate) : null,
            isCurrent: e.isCurrent ?? false,
            isGroupAService: e.isGroupAService ?? false,
            payLevel: e.payLevel,
            isLevel12OrAbove: e.isLevel12OrAbove ?? false,
            payBandOrRemuneration: e.payBandOrRemuneration,
            dutiesDescription: e.dutiesDescription,
          })),
        },
        certifications: {
          create: (input.certifications || []).map(c => ({
            name: c.name,
            issuingBody: c.issuingBody,
            yearObtained: c.yearObtained,
            certificateNumber: c.certificateNumber,
          })),
        },
      },
      include: { educations: true, experiences: true, certifications: true },
    });
    return profile;
  }

  // Create new profile
  const profile = await prisma.applicantProfile.create({
    data: {
      userId,
      fullName: input.fullName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender,
      fatherOrMotherOrSpouseName: input.fatherOrMotherOrSpouseName,
      backgroundType: input.backgroundType as any,
      correspondenceAddress: input.correspondenceAddress,
      permanentAddress: input.permanentAddress,
      contactNumbers: input.contactNumbers || [],
      aadhaarNumber: input.aadhaarNumber,
      panNumber: input.panNumber,
      lastOrganization: input.lastOrganization,
      lastDesignation: input.lastDesignation,
      lastPayLevel: input.lastPayLevel,
      retirementDate: input.retirementDate ? new Date(input.retirementDate) : null,
      ppoNumber: input.ppoNumber,
      photoUrl: photoUrl,
      educations: {
        create: input.educations.map(e => ({
          degree: e.degree,
          field: e.field,
          institution: e.institution,
          university: e.university,
          yearOfPassing: e.yearOfPassing,
          grade: e.grade,
          isPremierInstitute: e.isPremierInstitute ?? false,
          isDoctorate: e.isDoctorate ?? false,
          isPostGraduation: e.isPostGraduation ?? false,
        })),
      },
      experiences: {
        create: input.experiences.map(e => ({
          organization: e.organization,
          designation: e.designation,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : null,
          isCurrent: e.isCurrent ?? false,
          isGroupAService: e.isGroupAService ?? false,
          payLevel: e.payLevel,
          isLevel12OrAbove: e.isLevel12OrAbove ?? false,
          payBandOrRemuneration: e.payBandOrRemuneration,
          dutiesDescription: e.dutiesDescription,
        })),
      },
      certifications: {
        create: (input.certifications || []).map(c => ({
          name: c.name,
          issuingBody: c.issuingBody,
          yearObtained: c.yearObtained,
          certificateNumber: c.certificateNumber,
        })),
      },
    },
    include: { educations: true, experiences: true, certifications: true },
  });
  return profile;
}

/**
 * Get profile by userId.
 */
export async function getProfileByUserId(userId: string) {
  return prisma.applicantProfile.findUnique({
    where: { userId },
    include: { educations: true, experiences: true, certifications: true, documents: true },
  });
}

/**
 * Save document reference for a profile.
 */
export async function addDocument(profileId: string, documentType: string, fileName: string, fileUrl: string) {
  return prisma.document.create({
    data: { profileId, documentType, fileName, fileUrl },
  });
}
