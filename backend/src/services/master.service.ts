/**
 * Master data service — domains, sub-domains, offices, adverts.
 */

import { PrismaClient } from '@prisma/client';
import { IAdvertCreate, AdvertStatus } from '../types';

const prisma = new PrismaClient();

// ── Domains ──

export async function getDomains() {
  return prisma.domain.findMany({
    where: { isActive: true },
    include: { subDomains: { where: { isActive: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getSubDomains(domainId: string) {
  return prisma.subDomain.findMany({
    where: { domainId, isActive: true },
    orderBy: { name: 'asc' },
  });
}

// ── Offices ──

export async function getOffices() {
  return prisma.npcOffice.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

// ── Adverts (AI-858 Annex-I §3) ──

export async function getPublishedAdverts() {
  return prisma.advert.findMany({
    where: { status: 'PUBLISHED' },
    include: { domain: true, office: true },
    orderBy: { publishDate: 'desc' },
  });
}

export async function getAdvertById(id: string) {
  return prisma.advert.findUnique({
    where: { id },
    include: { domain: true, office: true },
  });
}

export async function getAllAdverts() {
  return prisma.advert.findMany({
    include: { domain: true, office: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAdvert(input: IAdvertCreate, createdByUserId: string) {
  return prisma.advert.create({
    data: {
      advertNumber: `NPC/ADV/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
      title: input.title,
      description: input.description,
      requisitionType: input.requisitionType,
      projectName: input.projectName,
      projectValue: input.projectValue,
      domainId: input.domainId || null,
      officeId: input.officeId || null,
      designation: input.designation,
      engagementType: input.engagementType,
      numberOfPosts: input.numberOfPosts,
      placeOfDeployment: input.placeOfDeployment,
      functionalRole: input.functionalRole,
      workResponsibilities: input.workResponsibilities,
      eligibilityCriteria: input.eligibilityCriteria,
      minQualification: input.minQualification,
      qualificationDetails: input.qualificationDetails,
      minExperienceYears: input.minExperienceYears,
      maxAge: input.maxAge,
      specificRequirements: input.specificRequirements,
      desirableSkills: input.desirableSkills,
      remunerationMin: input.remunerationMin,
      remunerationMax: input.remunerationMax,
      remunerationBasis: input.remunerationBasis,
      remunerationNote: input.remunerationNote,
      contractPeriodMonths: input.contractPeriodMonths,
      contractStartDate: input.contractStartDate,
      termsAndConditions: input.termsAndConditions,
      workingHoursNote: input.workingHoursNote,
      travelRequired: input.travelRequired ?? false,
      travelNote: input.travelNote,
      lastDateToApply: input.lastDateToApply,
      applicationEmail: input.applicationEmail,
      generalConditions: input.generalConditions,
      status: AdvertStatus.DRAFT,
      createdByUserId,
    },
    include: { domain: true, office: true },
  });
}

export async function updateAdvert(id: string, input: Partial<IAdvertCreate>) {
  return prisma.advert.update({
    where: { id },
    data: {
      ...input,
      domainId: input.domainId || undefined,
      officeId: input.officeId || undefined,
    },
    include: { domain: true, office: true },
  });
}

export async function publishAdvert(advertId: string) {
  return prisma.advert.update({
    where: { id: advertId },
    data: {
      status: AdvertStatus.PUBLISHED,
      publishDate: new Date(),
    },
    include: { domain: true, office: true },
  });
}

export async function closeAdvert(advertId: string) {
  return prisma.advert.update({
    where: { id: advertId },
    data: { status: 'CLOSED' },
  });
}
