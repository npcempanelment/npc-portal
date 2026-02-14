/**
 * Auto-seed: runs on first deploy to populate master data if DB is empty.
 * Safe to run repeatedly — uses upserts and existence checks.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function autoSeed() {
  const userCount = await prisma.user.count();
  const domainCount = await prisma.domain.count();

  if (userCount > 0 && domainCount > 0) {
    console.log('Database already seeded — skipping auto-seed.');
    return;
  }

  console.log('Auto-seeding database (first deploy)...');

  // ── Domains ──
  const domains = [
    { name: 'Information Technology', code: 'IT' },
    { name: 'Industrial Engineering', code: 'IE' },
    { name: 'Agri-Business', code: 'ABG' },
    { name: 'Economic Services & Productivity Promotion', code: 'ESPP' },
    { name: 'Energy Management', code: 'EM' },
    { name: 'Environment & Climate Action', code: 'ENV' },
    { name: 'Human Resource Management', code: 'HRM' },
    { name: 'Quality Management', code: 'QM' },
    { name: 'Technology Management', code: 'TM' },
  ];

  for (const d of domains) {
    await prisma.domain.upsert({ where: { code: d.code }, update: {}, create: d });
  }

  // ── Sub-domains ──
  const itDomain = await prisma.domain.findUnique({ where: { code: 'IT' } });
  if (itDomain) {
    for (const name of ['Software Development', 'Data Analytics & AI', 'Cybersecurity', 'Cloud Computing', 'IT Infrastructure', 'Digital Transformation']) {
      await prisma.subDomain.upsert({ where: { domainId_name: { domainId: itDomain.id, name } }, update: {}, create: { domainId: itDomain.id, name } });
    }
  }

  const ieDomain = await prisma.domain.findUnique({ where: { code: 'IE' } });
  if (ieDomain) {
    for (const name of ['Lean Manufacturing', 'Total Productive Maintenance', 'Supply Chain Management', 'Operations Research', 'Work Study & Ergonomics', 'Industrial Safety']) {
      await prisma.subDomain.upsert({ where: { domainId_name: { domainId: ieDomain.id, name } }, update: {}, create: { domainId: ieDomain.id, name } });
    }
  }

  // ── NPC Offices ──
  const offices = [
    { name: 'NPC Headquarters', city: 'New Delhi', state: 'Delhi', isHQ: true },
    { name: 'NPC Regional Directorate Chennai', city: 'Chennai', state: 'Tamil Nadu', isHQ: false },
    { name: 'NPC Regional Directorate Mumbai', city: 'Mumbai', state: 'Maharashtra', isHQ: false },
    { name: 'NPC Regional Directorate Kolkata', city: 'Kolkata', state: 'West Bengal', isHQ: false },
    { name: 'NPC Regional Directorate Bangalore', city: 'Bengaluru', state: 'Karnataka', isHQ: false },
    { name: 'NPC Regional Directorate Chandigarh', city: 'Chandigarh', state: 'Chandigarh', isHQ: false },
    { name: 'NPC Regional Directorate Hyderabad', city: 'Hyderabad', state: 'Telangana', isHQ: false },
    { name: 'NPC Regional Directorate Kanpur', city: 'Kanpur', state: 'Uttar Pradesh', isHQ: false },
    { name: 'NPC Regional Directorate Gandhinagar', city: 'Gandhinagar', state: 'Gujarat', isHQ: false },
    { name: 'NPC Regional Directorate Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', isHQ: false },
    { name: 'NPC Regional Directorate Jaipur', city: 'Jaipur', state: 'Rajasthan', isHQ: false },
    { name: 'NPC Regional Directorate Guwahati', city: 'Guwahati', state: 'Assam', isHQ: false },
    { name: 'NPC Regional Directorate Patna', city: 'Patna', state: 'Bihar', isHQ: false },
    { name: 'AIP Chennai', city: 'Chennai', state: 'Tamil Nadu', isHQ: false },
  ];

  for (const o of offices) {
    const existing = await prisma.npcOffice.findFirst({ where: { name: o.name } });
    if (!existing) await prisma.npcOffice.create({ data: o });
  }

  // ── Admin user ──
  const adminEmail = 'admin@npcindia.gov.in';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash('NpcAdmin@2026', 12),
        name: 'NPC Administrator',
        roles: ['ADMIN', 'IT_ADMIN'],
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  }

  // ── Eligibility rules ──
  const empRules = [
    { ruleType: 'EMPANELMENT', empanelmentCategory: 'ADVISOR', minExperienceYears: 20, minGroupAYears: 20, minLevel12Years: 10, description: 'Empanelment AI §2.3: Min 20yr Group-A + 10yr Level-12/13' },
    { ruleType: 'EMPANELMENT', empanelmentCategory: 'SENIOR_CONSULTANT', minExperienceYears: 13, minLevel12Years: 5, requiresPostGrad: true, description: 'Empanelment AI §2.3: 13yr + 5yr Level-12' },
    { ruleType: 'EMPANELMENT', empanelmentCategory: 'CONSULTANT', minExperienceYears: 6, maxExperienceYears: 13, requiresPostGrad: true, description: 'Empanelment AI §2.3: 6-13yr + Post-Grad' },
    { ruleType: 'EMPANELMENT', empanelmentCategory: 'PROJECT_ASSOCIATE', minExperienceYears: 0, maxExperienceYears: 6, requiresPostGrad: true, description: 'Empanelment AI §2.3: 0-6yr + Post-Grad' },
    { ruleType: 'EMPANELMENT', empanelmentCategory: 'YOUNG_PROFESSIONAL', maxAge: 35, requiresPremierInst: true, description: 'Empanelment AI §2.3: Premier institute + age ≤35' },
  ];

  for (const rule of empRules) {
    const existing = await prisma.eligibilityRule.findFirst({ where: { ruleType: rule.ruleType, empanelmentCategory: rule.empanelmentCategory as any } });
    if (!existing) await prisma.eligibilityRule.create({ data: rule as any });
  }

  // ── Sample adverts ──
  const COMMON_TERMS = `The engagement shall be purely on a contract basis and will not confer any right for regular appointment in NPC.`;
  const COMMON_GENERAL = `NPC may terminate the contract at any time without notice if performance is unsatisfactory. Original documents must be produced at time of joining.`;

  const hqOffice = await prisma.npcOffice.findFirst({ where: { city: { contains: 'Delhi' } } });
  const chennaiOffice = await prisma.npcOffice.findFirst({ where: { city: 'Chennai', isHQ: false } });
  const econDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Economic' } } });
  const energyDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Energy' } } });
  const hrmDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Human' } } });
  const itDomainRef = await prisma.domain.findFirst({ where: { name: { contains: 'Information' } } });
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@npcindia.gov.in' } });

  const adverts = [
    {
      advertNumber: 'NPC/Admin108/Feb2026/Q01',
      title: 'Account Officer - Finance Division, NPC HQ',
      description: 'NPC HQ invites applications for 1 Account Officer post in Finance Division on contractual basis.',
      requisitionType: 'ADMIN_FINANCE', designation: 'EXPERT_RETIRED', engagementType: 'FULL_TIME',
      numberOfPosts: 1, placeOfDeployment: 'NPC HQ Finance Division, New Delhi',
      officeId: hqOffice?.id, domainId: econDomain?.id, functionalRole: 'Account Officer',
      workResponsibilities: 'Processing of medical reimbursement, TA claims, accounting in Tally ERP',
      eligibilityCriteria: 'Govt. Retired employees at minimum Level 7 in a similar profile.',
      minQualification: 'Govt. Retired at minimum Pay Level 7',
      minExperienceYears: 0, maxAge: 65, remunerationMin: 0, remunerationMax: 0,
      remunerationBasis: 'MONTHLY', remunerationNote: '50% of last salary drawn (Basic + DA) per month',
      contractPeriodMonths: 12, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/Admin108/Feb2026/Q02',
      title: 'Account Executive - Finance Division, NPC HQ',
      description: 'NPC HQ invites applications for 1 Account Executive post in Finance Division.',
      requisitionType: 'ADMIN_FINANCE', designation: 'ACCOUNTS_EXECUTIVE', engagementType: 'FULL_TIME',
      numberOfPosts: 1, placeOfDeployment: 'NPC HQ Finance Division, New Delhi',
      officeId: hqOffice?.id, domainId: econDomain?.id, functionalRole: 'Account Executive',
      workResponsibilities: 'TA bills processing, project accounts in Tally, vendor payments, TDS reconciliation',
      eligibilityCriteria: 'M.Com / MBA (Finance) with 3 years experience. Tally ERP, Excel, TDS & GST.',
      minQualification: 'M.Com / MBA (Finance)',
      minExperienceYears: 3, maxAge: 65, remunerationMin: 31000, remunerationMax: 31000,
      remunerationBasis: 'MONTHLY', remunerationNote: 'Rs 31,000/- per month',
      contractPeriodMonths: 12, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/Chennai/Feb2026/PE1',
      title: 'Project Associate (Environment) - Pondicherry',
      description: 'NPC Chennai invites applications for 2 Project Associate (Environment) posts.',
      requisitionType: 'PROJECT', designation: 'PROJECT_EXECUTIVE', engagementType: 'FULL_TIME',
      numberOfPosts: 2, placeOfDeployment: 'Pondicherry',
      officeId: chennaiOffice?.id, domainId: energyDomain?.id,
      functionalRole: 'Project Associate (Environment)',
      workResponsibilities: 'Survey at industry level, data collection, compilation, report preparation',
      eligibilityCriteria: 'B.E / B.Tech in any Discipline. English and Tamil communication.',
      minQualification: 'B.E / B.Tech in any Discipline',
      minExperienceYears: 0, maxAge: 65, remunerationMin: 26000, remunerationMax: 28000,
      remunerationBasis: 'MONTHLY', remunerationNote: 'Rs 26,000-28,000 per month',
      contractPeriodMonths: 6, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'chennai@npcindia.gov.in', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, travelRequired: true, status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/HQ/HRM/107/Adv01',
      title: 'Project Advisor (Statistician) - Organisational Study, HRM Group',
      description: 'NPC HQ invites applications for 1 Project Advisor (Statistician).',
      requisitionType: 'PROJECT', designation: 'ADVISOR_CONTRACT', engagementType: 'FULL_TIME',
      numberOfPosts: 1, placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id, domainId: hrmDomain?.id,
      functionalRole: 'Project Advisor (Statistician)',
      workResponsibilities: 'Organisational study design, international benchmarking, macro-level reforms',
      eligibilityCriteria: 'Bachelor/Master in Statistics. 20 years experience. ISS cadre Level 14+ preferred.',
      minQualification: "Bachelor's/Master's in Statistics",
      minExperienceYears: 20, maxAge: 65, remunerationMin: 125000, remunerationMax: 125000,
      remunerationBasis: 'MONTHLY', remunerationNote: 'Rs 1,25,000/- per month',
      contractPeriodMonths: 6, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/HQ/HRM/107/Adv02',
      title: 'Project Advisor (Economist) - Organisational Study, HRM Group',
      description: 'NPC HQ invites applications for 1 Project Advisor (Economist). Part-time, 30 man-days.',
      requisitionType: 'PROJECT', designation: 'ADVISOR_CONTRACT', engagementType: 'PART_TIME',
      numberOfPosts: 1, placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id, domainId: econDomain?.id,
      functionalRole: 'Project Advisor (Economist)',
      workResponsibilities: 'International benchmarking, institutional reforms, economic rationale analysis',
      eligibilityCriteria: 'PG in Economics. 20 years in economic statistics. Level 14+ preferred.',
      minQualification: 'PG in Economics/Applied Economics/Econometrics',
      minExperienceYears: 20, maxAge: 65, remunerationMin: 10000, remunerationMax: 10000,
      remunerationBasis: 'DAILY', remunerationNote: 'Rs 10,000/- per man-day (30 man-days)',
      contractPeriodMonths: 6, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/HQ/HRM/107/SE04',
      title: 'Senior Executive (Data Analytics & Survey) - Organisational Study',
      description: 'NPC HQ invites applications for 2 Senior Executive posts. Full-time, 6 months.',
      requisitionType: 'PROJECT', designation: 'SENIOR_PROFESSIONAL', engagementType: 'FULL_TIME',
      numberOfPosts: 2, placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id, domainId: hrmDomain?.id,
      functionalRole: 'Senior Executive',
      workResponsibilities: 'Research, data collection, org charts, process maps, workload analysis',
      eligibilityCriteria: "Master's in Economics/Finance/Statistics/Management/MSW OR B.E/B.Tech. 2 years experience.",
      minQualification: "Master's in Economics/Finance/Statistics/Management OR B.E/B.Tech",
      minExperienceYears: 2, maxAge: 65, remunerationMin: 33000, remunerationMax: 50000,
      remunerationBasis: 'MONTHLY', remunerationNote: 'Rs 33,000-50,000/month based on experience',
      contractPeriodMonths: 6, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
    {
      advertNumber: 'NPC/HQ/HRM/107/PE05',
      title: 'Project Executive - Organisational Study, HRM Group',
      description: 'NPC HQ invites applications for 4 Project Executive posts. Full-time, 6 months.',
      requisitionType: 'PROJECT', designation: 'PROJECT_EXECUTIVE', engagementType: 'FULL_TIME',
      numberOfPosts: 4, placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id, domainId: hrmDomain?.id,
      functionalRole: 'Project Executive',
      workResponsibilities: 'Data collection, work-measurement studies, org charts, documentation',
      eligibilityCriteria: "B.E/B.Tech in any discipline. 1-5 years experience in project execution.",
      minQualification: 'B.E / B.Tech in any discipline',
      minExperienceYears: 1, maxAge: 65, remunerationMin: 25000, remunerationMax: 37000,
      remunerationBasis: 'MONTHLY', remunerationNote: 'Rs 25,000-37,000/month based on experience',
      contractPeriodMonths: 6, lastDateToApply: new Date('2026-03-31'), publishDate: new Date(),
      applicationEmail: 'npc036902@gmail.com', termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL, status: 'PUBLISHED', createdByUserId: adminUser?.id,
    },
  ];

  for (const advert of adverts) {
    const existing = await prisma.advert.findUnique({ where: { advertNumber: advert.advertNumber } });
    if (!existing) {
      await prisma.advert.create({ data: advert as any });
      console.log(`  [seeded] ${advert.advertNumber}`);
    }
  }

  console.log('Auto-seed completed.');
  await prisma.$disconnect();
}
