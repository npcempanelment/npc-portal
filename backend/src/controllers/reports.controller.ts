/**
 * Reports controller — admin reports with stats and CSV export.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /admin/reports/stats
 * Dashboard summary statistics.
 */
export async function getStats(_req: Request, res: Response) {
  try {
    const [
      totalAdverts,
      publishedAdverts,
      totalContractualApps,
      eligibleContractualApps,
      totalEmpanelmentApps,
      eligibleEmpanelmentApps,
      totalProfiles,
      totalUsers,
    ] = await Promise.all([
      prisma.advert.count(),
      prisma.advert.count({ where: { status: 'PUBLISHED' } }),
      prisma.contractualApplication.count(),
      prisma.contractualApplication.count({ where: { autoScreenEligible: true } }),
      prisma.empanelmentApplication.count(),
      prisma.empanelmentApplication.count({ where: { autoScreenEligible: true } }),
      prisma.applicantProfile.count(),
      prisma.user.count({ where: { roles: { has: 'APPLICANT' } } }),
    ]);

    // Applications by status
    const contractualByStatus = await prisma.contractualApplication.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const empanelmentByStatus = await prisma.empanelmentApplication.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Applications per advert
    const appsPerAdvert = await prisma.advert.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        advertNumber: true,
        title: true,
        designation: true,
        numberOfPosts: true,
        lastDateToApply: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalAdverts,
          publishedAdverts,
          totalContractualApps,
          eligibleContractualApps,
          totalEmpanelmentApps,
          eligibleEmpanelmentApps,
          totalProfiles,
          totalUsers,
        },
        contractualByStatus: contractualByStatus.map(s => ({ status: s.status, count: s._count.id })),
        empanelmentByStatus: empanelmentByStatus.map(s => ({ status: s.status, count: s._count.id })),
        appsPerAdvert: appsPerAdvert.map(a => ({
          advertNumber: a.advertNumber,
          title: a.title,
          designation: a.designation,
          numberOfPosts: a.numberOfPosts,
          lastDateToApply: a.lastDateToApply,
          applicationCount: a._count.applications,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /admin/reports/contractual-applications
 * All contractual applications with applicant details.
 * Supports ?format=csv for CSV download.
 */
export async function getContractualApplicationsReport(req: Request, res: Response) {
  try {
    const applications = await prisma.contractualApplication.findMany({
      include: {
        profile: {
          include: {
            user: { select: { email: true, name: true } },
            educations: true,
            experiences: true,
            documents: true,
          },
        },
        advert: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (req.query.format === 'csv') {
      const headers = [
        'Application ID', 'Advert Number', 'Advert Title', 'Designation', 'Engagement Type',
        'Applicant Name', 'Email', 'DOB', 'Gender', 'Background Type', 'PAN',
        'Highest Education', 'Institution', 'Total Experience (Years)', 'Current Organization',
        'Current Designation', 'Auto-Screen Eligible', 'Meets Qualification', 'Meets Experience',
        'Meets Age', 'Computed Age', 'Screening Reasons', 'Status', 'Submitted At',
        'Documents Count',
      ];

      const rows = applications.map(a => {
        const highestEdu = a.profile.educations.sort((x, y) => y.yearOfPassing - x.yearOfPassing)[0];
        const currentExp = a.profile.experiences.find(e => e.isCurrent);
        return [
          a.id,
          a.advert.advertNumber,
          `"${a.advert.title.replace(/"/g, '""')}"`,
          a.advert.designation,
          a.advert.engagementType,
          `"${a.profile.user.name}"`,
          a.profile.user.email,
          a.profile.dateOfBirth.toISOString().split('T')[0],
          a.profile.gender || '',
          a.profile.backgroundType,
          a.profile.panNumber || '',
          highestEdu ? `"${highestEdu.degree} ${highestEdu.field}"` : '',
          highestEdu ? `"${highestEdu.institution}"` : '',
          a.computedTotalExpYears ?? '',
          currentExp ? `"${currentExp.organization}"` : '',
          currentExp ? `"${currentExp.designation}"` : '',
          a.autoScreenEligible ? 'Yes' : 'No',
          a.meetsQualification ? 'Yes' : 'No',
          a.meetsExperience ? 'Yes' : 'No',
          a.meetsAge ? 'Yes' : 'No',
          a.computedAge ?? '',
          `"${(a.autoScreenReasons as string[]).join('; ')}"`,
          a.status,
          a.submittedAt?.toISOString().split('T')[0] || '',
          a.profile.documents.length,
        ].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contractual_applications_report.csv');
      res.send(csv);
      return;
    }

    // JSON response
    res.json({
      success: true,
      data: applications.map(a => {
        const currentExp = a.profile.experiences.find(e => e.isCurrent);
        return {
          id: a.id,
          advertNumber: a.advert.advertNumber,
          advertTitle: a.advert.title,
          designation: a.advert.designation,
          engagementType: a.advert.engagementType,
          applicantName: a.profile.user.name,
          email: a.profile.user.email,
          dob: a.profile.dateOfBirth,
          gender: a.profile.gender,
          backgroundType: a.profile.backgroundType,
          currentOrganization: currentExp?.organization || null,
          currentDesignation: currentExp?.designation || null,
          totalExperience: a.computedTotalExpYears,
          computedAge: a.computedAge,
          autoScreenEligible: a.autoScreenEligible,
          meetsQualification: a.meetsQualification,
          meetsExperience: a.meetsExperience,
          meetsAge: a.meetsAge,
          screeningReasons: a.autoScreenReasons,
          status: a.status,
          submittedAt: a.submittedAt,
          documentsCount: a.profile.documents.length,
          documents: a.profile.documents.map(d => ({
            id: d.id,
            documentType: d.documentType,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            uploadedAt: d.uploadedAt,
          })),
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /admin/reports/empanelment-applications
 * All empanelment applications with applicant details.
 * Supports ?format=csv for CSV download.
 */
export async function getEmpanelmentApplicationsReport(req: Request, res: Response) {
  try {
    const applications = await prisma.empanelmentApplication.findMany({
      include: {
        profile: {
          include: {
            user: { select: { email: true, name: true } },
            educations: true,
            experiences: true,
            documents: true,
          },
        },
        domain: true,
        subDomain: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (req.query.format === 'csv') {
      const headers = [
        'Application ID', 'Domain', 'Sub-Domain', 'Empanelment Area',
        'Applicant Name', 'Email', 'DOB', 'Gender', 'Background Type',
        'Total Experience (Years)', 'Group A Years', 'Level 12+ Years',
        'Auto-Screen Eligible', 'Provisional Category', 'Screening Reasons',
        'Status', 'Submitted At', 'Documents Count',
      ];

      const rows = applications.map(a => [
        a.id,
        `"${a.domain?.name || ''}"`,
        `"${a.subDomain?.name || ''}"`,
        a.empanelmentArea,
        `"${a.profile.user.name}"`,
        a.profile.user.email,
        a.profile.dateOfBirth.toISOString().split('T')[0],
        a.profile.gender || '',
        a.profile.backgroundType,
        a.computedTotalExpYears ?? '',
        a.computedGroupAYears ?? '',
        a.computedLevel12Years ?? '',
        a.autoScreenEligible ? 'Yes' : 'No',
        a.autoScreenCategory || '',
        `"${(a.autoScreenReasons as string[]).join('; ')}"`,
        a.status,
        a.submittedAt?.toISOString().split('T')[0] || '',
        a.profile.documents.length,
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=empanelment_applications_report.csv');
      res.send(csv);
      return;
    }

    res.json({
      success: true,
      data: applications.map(a => ({
        id: a.id,
        domain: a.domain?.name || null,
        subDomain: a.subDomain?.name || null,
        empanelmentArea: a.empanelmentArea,
        applicantName: a.profile.user.name,
        email: a.profile.user.email,
        dob: a.profile.dateOfBirth,
        backgroundType: a.profile.backgroundType,
        totalExperience: a.computedTotalExpYears,
        groupAYears: a.computedGroupAYears,
        level12Years: a.computedLevel12Years,
        autoScreenEligible: a.autoScreenEligible,
        provisionalCategory: a.autoScreenCategory,
        screeningReasons: a.autoScreenReasons,
        status: a.status,
        submittedAt: a.submittedAt,
        documentsCount: a.profile.documents.length,
        documents: a.profile.documents.map(d => ({
          id: d.id,
          documentType: d.documentType,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          uploadedAt: d.uploadedAt,
        })),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
