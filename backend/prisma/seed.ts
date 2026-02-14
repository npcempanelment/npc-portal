/**
 * Database seed script — populates master data.
 * Domains from existing NPC portal; offices from NPC's known locations.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NPC Portal database...');

  // ── Domains (from NPC website) ──
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
    await prisma.domain.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }

  // ── Sample sub-domains ──
  const itDomain = await prisma.domain.findUnique({ where: { code: 'IT' } });
  if (itDomain) {
    const subDomains = [
      'Software Development', 'Data Analytics & AI', 'Cybersecurity',
      'Cloud Computing', 'IT Infrastructure', 'Digital Transformation',
    ];
    for (const name of subDomains) {
      await prisma.subDomain.upsert({
        where: { domainId_name: { domainId: itDomain.id, name } },
        update: {},
        create: { domainId: itDomain.id, name },
      });
    }
  }

  const ieDomain = await prisma.domain.findUnique({ where: { code: 'IE' } });
  if (ieDomain) {
    const subDomains = [
      'Lean Manufacturing', 'Total Productive Maintenance', 'Supply Chain Management',
      'Operations Research', 'Work Study & Ergonomics', 'Industrial Safety',
    ];
    for (const name of subDomains) {
      await prisma.subDomain.upsert({
        where: { domainId_name: { domainId: ieDomain.id, name } },
        update: {},
        create: { domainId: ieDomain.id, name },
      });
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
    if (!existing) {
      await prisma.npcOffice.create({ data: o });
    }
  }

  // ── Default Admin user ──
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

  // ── Eligibility rules (from Empanelment AI §2.3) ──
  const empRules = [
    {
      ruleType: 'EMPANELMENT',
      empanelmentCategory: 'ADVISOR',
      minExperienceYears: 20,
      minGroupAYears: 20,
      minLevel12Years: 10,
      description: 'Empanelment AI §2.3: Min 20yr Group-A + 10yr Level-12/13; OR Doctorate + 25yr',
    },
    {
      ruleType: 'EMPANELMENT',
      empanelmentCategory: 'SENIOR_CONSULTANT',
      minExperienceYears: 13,
      minLevel12Years: 5,
      requiresPostGrad: true,
      description: 'Empanelment AI §2.3: 13yr + 5yr Level-12; OR Post-Grad + 13yr',
    },
    {
      ruleType: 'EMPANELMENT',
      empanelmentCategory: 'CONSULTANT',
      minExperienceYears: 6,
      maxExperienceYears: 13,
      requiresPostGrad: true,
      description: 'Empanelment AI §2.3: 6-13yr + Post-Grad/Engineering',
    },
    {
      ruleType: 'EMPANELMENT',
      empanelmentCategory: 'PROJECT_ASSOCIATE',
      minExperienceYears: 0,
      maxExperienceYears: 6,
      requiresPostGrad: true,
      description: 'Empanelment AI §2.3: 0-6yr + Post-Grad/Engineering',
    },
    {
      ruleType: 'EMPANELMENT',
      empanelmentCategory: 'YOUNG_PROFESSIONAL',
      maxAge: 35,
      requiresPremierInst: true,
      description: 'Empanelment AI §2.3: Premier institute degree + age ≤35',
    },
  ];

  for (const rule of empRules) {
    const existing = await prisma.eligibilityRule.findFirst({
      where: { ruleType: rule.ruleType, empanelmentCategory: rule.empanelmentCategory as any },
    });
    if (!existing) {
      await prisma.eligibilityRule.create({ data: rule as any });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
