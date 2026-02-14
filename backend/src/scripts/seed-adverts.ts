/**
 * Seed script: Insert job postings from actual NPC advertisements.
 * Each post code gets its own advert record.
 * Run: npx ts-node src/scripts/seed-adverts.ts
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const COMMON_TERMS = `The engagement shall be purely on a contract basis and will not confer any right for regular appointment in NPC or in its associated organizations. The contractual person shall not be entitled to any benefits/compensation/absorption/regularization of service in NPC under the provision of Industrial Disputes Act, 1947 or Contract Labour (Regulation and Abolition) Act, 1970.`;

const COMMON_GENERAL = `NPC may terminate the contract at any time without notice if performance is unsatisfactory. Original documents and certificates must be produced at the time of joining. NPC reserves the right to cancel or withdraw this advertisement at any time without assigning any reason.`;

async function main() {
  // ── Step 0: Delete old combined adverts ──
  const oldNumbers = [
    'NPC/Admin108/February/2026',
    'NPC/Chennai/PE/February/2026',
    'NPC/HQ/HRM/107/2025-26',
  ];
  for (const num of oldNumbers) {
    const existing = await prisma.advert.findUnique({ where: { advertNumber: num } });
    if (existing) {
      await prisma.advert.delete({ where: { advertNumber: num } });
      console.log(`Deleted old combined advert: ${num}`);
    }
  }

  // ── Lookup references ──
  const hqOffice = await prisma.npcOffice.findFirst({ where: { city: { contains: 'Delhi' } } });
  const chennaiOffice = await prisma.npcOffice.findFirst({ where: { city: { contains: 'Chennai' } } });

  const econDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Economic' } } });
  const energyDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Energy' } } });
  const hrmDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Human' } } });
  const itDomain = await prisma.domain.findFirst({ where: { name: { contains: 'Information' } } });

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@npcindia.gov.in' } });

  const adverts = [
    // ═══════════════════════════════════════════════════════════
    // ADV 108 — Finance Division, NPC HQ (3 Feb 2026)
    // ═══════════════════════════════════════════════════════════

    // Q:01 — Account Officer (Expert Retired)
    {
      advertNumber: 'NPC/Admin108/Feb2026/Q01',
      title: 'Account Officer - Finance Division, NPC HQ',
      description: `NPC HQ, New Delhi invites applications for 1 Account Officer post in the Finance Division on contractual basis. This position is for Govt. retired employees at minimum Level 7 in a similar profile. Remuneration: 50% of last salary drawn (Basic + DA) per month. Candidates should have their own laptop.`,
      requisitionType: 'ADMIN_FINANCE',
      designation: 'EXPERT_RETIRED',
      engagementType: 'FULL_TIME',
      numberOfPosts: 1,
      placeOfDeployment: 'NPC HQ Finance Division, New Delhi',
      officeId: hqOffice?.id,
      domainId: econDomain?.id,
      functionalRole: 'Account Officer',
      workResponsibilities: `- Processing of medical reimbursement claims as per CGHS & CS(MA) Rule
- Scrutiny and settlement of TA claims of HQ and Regional offices in accordance with GFR/NPC Rule
- Processing and adjustment of tour advances and settlement
- Examination and settlement of LTC claims as per applicable rules
- Accounting and booking of all related expenditures in Tally ERP
- Preparation and processing of payment vouchers with complete documentation
- Maintenance of proper financial records, supporting documents, and audit-ready files; coordination with internal and external audit teams
- Other additional tasks assigned by finance officers from time to time`,
      eligibilityCriteria: 'Govt. Retired employees at minimum Level 7 in a similar profile.',
      minQualification: 'Govt. Retired at minimum Pay Level 7 in similar finance/accounts profile',
      minExperienceYears: 0,
      maxAge: 65,
      remunerationMin: 0,
      remunerationMax: 0,
      remunerationBasis: 'MONTHLY',
      remunerationNote: '50% of last salary drawn (Basic + DA) per month for Retired Govt. employee',
      contractPeriodMonths: 12,
      lastDateToApply: new Date('2026-02-18'),
      publishDate: new Date('2026-02-03'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' All candidates should have their own laptop. No laptop will be provided by the Organization.',
      workingHoursNote: 'As per applicable NPC provisions',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // Q:02 — Account Executive
    {
      advertNumber: 'NPC/Admin108/Feb2026/Q02',
      title: 'Account Executive - Finance Division, NPC HQ',
      description: `NPC HQ, New Delhi invites applications for 1 Account Executive post in the Finance Division on contractual basis. Requires M.Com / MBA (Finance) with minimum 3 years experience. Must have hands-on experience in Tally ERP, Advanced Excel, TDS & GST return filing. Candidates should have their own laptop.`,
      requisitionType: 'ADMIN_FINANCE',
      designation: 'ACCOUNTS_EXECUTIVE',
      engagementType: 'FULL_TIME',
      numberOfPosts: 1,
      placeOfDeployment: 'NPC HQ Finance Division, New Delhi',
      officeId: hqOffice?.id,
      domainId: econDomain?.id,
      functionalRole: 'Account Executive',
      workResponsibilities: `- Scrutiny, processing, and settlement of TA bills, including tour advance, miscellaneous advances, and Transfer TA bills, in accordance with applicable rules
- Maintenance of project-wise accounts including recording of income and expenditure in Tally ERP and upkeep of manual Project Registers for CAG audit compliance
- Processing of vendor payments and preparation of Journal, Payment, and TDS vouchers in Tally
- Reconciliation of TDS (Form 26AS - vendors) and reconciliation of EMD and unclaimed receipt entries in accounting records
- Handling of bank-related transactions, including deposit of miscellaneous/specialist charges, maintenance of prescribed registers, and issuance/extension and reconciliation of Bank Guarantees
- Maintenance of records, registers, and supporting documents in compliance with Government accounting standards and audit requirements
- Other additional tasks assigned by finance officers from time to time`,
      eligibilityCriteria: 'Qualification: M.Com / MBA (Finance). Experience: Minimum 3 years in a similar profile. Essential: Hands-on experience in Tally ERP and Advanced Excel; working knowledge of TDS return filing and GST return filing.',
      minQualification: 'M.Com / MBA (Finance)',
      qualificationDetails: 'M.Com / MBA (Finance) with hands-on experience in Tally ERP, Advanced Excel, TDS & GST return filing',
      minExperienceYears: 3,
      maxAge: 65,
      remunerationMin: 31000,
      remunerationMax: 31000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 31,000/- per month',
      contractPeriodMonths: 12,
      lastDateToApply: new Date('2026-02-18'),
      publishDate: new Date('2026-02-03'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' All candidates should have their own laptop. No laptop will be provided by the Organization.',
      workingHoursNote: 'As per applicable NPC provisions',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // ═══════════════════════════════════════════════════════════
    // Chennai/Pondicherry - Project Associates (Feb 2026)
    // ═══════════════════════════════════════════════════════════

    // PE:1 — Project Associate (Environment)
    {
      advertNumber: 'NPC/Chennai/Feb2026/PE1',
      title: 'Project Associate (Environment) - Pondicherry',
      description: `NPC Chennai office invites applications for 2 Project Associate (Environment) posts for project work in Pondicherry. Full-time contractual engagement for 6 months (extendable based on project requirement).`,
      requisitionType: 'PROJECT',
      projectName: 'MSME Environment Audit - Pondicherry',
      designation: 'PROJECT_EXECUTIVE',
      engagementType: 'FULL_TIME',
      numberOfPosts: 2,
      placeOfDeployment: 'Pondicherry',
      officeId: chennaiOffice?.id,
      domainId: energyDomain?.id,
      functionalRole: 'Project Associate (Environment)',
      workResponsibilities: `- Carrying out survey at Industry / Institutional level
- Data collection
- Data compilation
- Assistance in report preparation`,
      eligibilityCriteria: 'Minimum educational qualification: B.E / B.Tech in any Discipline from a Government recognized university / institution. Skills required: Effective communication skills in English and Tamil. Preferred: Experience in data collection and compilation, Command over MS Office.',
      minQualification: 'B.E / B.Tech in any Discipline',
      qualificationDetails: 'B.E / B.Tech in any Discipline from a Government recognized university / institution',
      minExperienceYears: 0,
      maxAge: 65,
      desirableSkills: 'Data collection and compilation experience, MS Office proficiency, English and Tamil communication',
      remunerationMin: 26000,
      remunerationMax: 28000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 26,000 to Rs 28,000 per month',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-24'),
      publishDate: new Date('2026-02-03'),
      applicationEmail: 'chennai@npcindia.gov.in',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' Records and data pertaining to NPC/Client must be safeguarded and not shared with any third party.',
      workingHoursNote: 'As per applicable NPC provisions',
      travelRequired: true,
      travelNote: 'Field visits to industries/institutions in Pondicherry region',
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // PE:2 — Project Associate (Industrial Engineering)
    {
      advertNumber: 'NPC/Chennai/Feb2026/PE2',
      title: 'Project Associate (Industrial Engineering) - Chennai/Pondicherry',
      description: `NPC Chennai office invites applications for 3 Project Associate (Industrial Engineering) posts (1 at Chennai, 2 at Pondicherry). Full-time contractual engagement for 12 months (extendable based on performance and requirement).`,
      requisitionType: 'PROJECT',
      projectName: 'MSME Energy & Water Audit - Pondicherry',
      designation: 'PROJECT_EXECUTIVE',
      engagementType: 'FULL_TIME',
      numberOfPosts: 3,
      placeOfDeployment: 'Chennai (1 post) / Pondicherry (2 posts)',
      officeId: chennaiOffice?.id,
      domainId: energyDomain?.id,
      functionalRole: 'Project Associate (Industrial Engineering)',
      workResponsibilities: `- Conduct field study like energy audit / water audit for MSME Beneficiaries in the region of Pondicherry
- Data collection, compilation, and analysis
- Assistance in audit report preparation`,
      eligibilityCriteria: 'Graduate in Engineering with minimum 1 year of experience OR Diploma in Engineering with minimum 5 years of experience.',
      minQualification: 'Graduate in Engineering (1 yr exp) OR Diploma in Engineering (5 yrs exp)',
      qualificationDetails: 'Graduate in Engineering with minimum 1 year of experience or Diploma in Engineering with minimum 5 years of experience',
      minExperienceYears: 1,
      maxAge: 65,
      remunerationMin: 25000,
      remunerationMax: 37000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 25,000 to Rs 37,000 per month based on experience',
      contractPeriodMonths: 12,
      lastDateToApply: new Date('2026-02-24'),
      publishDate: new Date('2026-02-03'),
      applicationEmail: 'chennai@npcindia.gov.in',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' Records and data pertaining to NPC/Client must be safeguarded and not shared with any third party.',
      workingHoursNote: 'As per applicable NPC provisions',
      travelRequired: true,
      travelNote: 'Field visits to MSME units in Pondicherry region for energy/water audits',
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // ═══════════════════════════════════════════════════════════
    // ADV 107 — HRM Group, Organisational Study (2 Feb 2026)
    // ═══════════════════════════════════════════════════════════

    // Adv/01 — Project Advisor (Statistician)
    {
      advertNumber: 'NPC/HQ/HRM/107/Adv01',
      title: 'Project Advisor (Statistician) - Organisational Study, HRM Group',
      description: `HRM Group at NPC HQ, New Delhi invites applications for 1 Project Advisor (Statistician) for an Organisational Study project. Full-time contractual engagement for 6 months (extendable).`,
      requisitionType: 'PROJECT',
      projectName: 'NPC Organisational Study',
      designation: 'ADVISOR_CONTRACT',
      engagementType: 'FULL_TIME',
      numberOfPosts: 1,
      placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id,
      domainId: hrmDomain?.id,
      functionalRole: 'Project Advisor (Statistician)',
      workResponsibilities: `- Assist in the overall design and direction of the organisational study, ensuring alignment with mandate and Terms of Reference
- Conduct benchmarking with international statistical systems (UNSD, OECD, Eurostat, Statistics Canada, etc.) to identify global best practices in statistical governance, organisational structure, standards, and manpower norms
- Assist in recommending macro-level reforms, including structural reorganisation, delayering, functional realignment, rationalisation of divisions/units, and strengthening of the national statistical system
- Assist in proposing policy-level changes relating to coordination frameworks, reporting structures, technical standards, roles & responsibilities, and institutional accountability
- Guide assessment of organisational structure, mandate clarity, decision-making architecture, workload distribution, process gaps, duplication of functions, and efficiency constraints
- Advise in work-measurement studies, manpower analysis, and development of performance standards and norms for administrative and technical units
- Identify opportunities for process improvements, digital transformation, automation, and e-governance to enhance operational efficiency
- Review and validate milestone-based reports, diagnostic assessments, process maps, reform options, and final recommendations
- Facilitate strategic consultations with senior officials, provide expert inputs during review meetings
- Mentor and guide the project team to ensure methodological rigour, adherence to ToR, and timely completion of deliverables`,
      eligibilityCriteria: `Qualification: Bachelor's Degree with Statistics/Mathematical Statistics/Applied Statistics as one of the subjects or a Master's degree in Statistics/Mathematical Statistics/Applied Statistics from a Government recognized University or Institute (regular degree).
Experience: (I) Minimum 20 years of work experience with expertise in Indian statistical system management, norms and standards in the field of statistics, statistical methodology, preparation and publication of various reports of central statistics, conducting nation-wide sample surveys, etc. (II) Working experience in organizations like MoSPI or statistical units of Ministries/Departments and belonging to ISS cadre (Level 14 & above) will be preferred.`,
      minQualification: 'Bachelor\'s/Master\'s in Statistics/Mathematical Statistics/Applied Statistics',
      qualificationDetails: 'Bachelor\'s Degree with Statistics as a subject or Master\'s in Statistics from a recognized University (regular degree)',
      minExperienceYears: 20,
      maxAge: 65,
      specificRequirements: 'ISS cadre (Level 14 & above) preferred. Expertise in Indian statistical system management.',
      remunerationMin: 125000,
      remunerationMax: 125000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 1,25,000/- per month',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-16'),
      publishDate: new Date('2026-02-02'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' The selected candidate should carry own laptop. No laptop/desktop will be provided by the Organization.',
      workingHoursNote: 'Normal office timings',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // Adv/02 — Project Advisor (Economist)
    {
      advertNumber: 'NPC/HQ/HRM/107/Adv02',
      title: 'Project Advisor (Economist) - Organisational Study, HRM Group',
      description: `HRM Group at NPC HQ, New Delhi invites applications for 1 Project Advisor (Economist) for an Organisational Study project. Part-time contractual engagement for 30 man-days (extendable).`,
      requisitionType: 'PROJECT',
      projectName: 'NPC Organisational Study',
      designation: 'ADVISOR_CONTRACT',
      engagementType: 'PART_TIME',
      numberOfPosts: 1,
      placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id,
      domainId: econDomain?.id,
      functionalRole: 'Project Advisor (Economist)',
      workResponsibilities: `- Conduct international benchmarking with organizations such as OECD, IMF, World Bank, Eurostat, UNSD and advanced national statistical systems to understand global economic governance structures, indicator frameworks, macro-monitoring systems, and inter-agency data coordination models
- Recommend macro-level institutional reforms for Indian statistical systems from an economic system perspective — covering restructuring of economic statistics divisions, strengthening analytical units, rationalising functions, and improving national data architecture
- Propose policy-level reforms to enhance the coherence, reliability, comparability and timeliness of national economic indicators (GDP, IIP, CPI, labour statistics, social statistics, SDGs, etc.)
- Examine and articulate the economic rationale behind production of official statistics — how they support evidence-based policy and link to national development priorities, economic modelling, forecasting and budget planning
- Assess how different Ministries collect data for diverse schemes, programmes, and compliance purposes, and recommend frameworks for integration, interoperability, and reduction of duplication
- Evaluate existing coordination mechanisms for economic and administrative data (e.g., between MoSPI, RBI, DEA, DBT, Labour, Agriculture, MSME, line Ministries)
- Provide expert insights on decision-making hierarchy, planning, monitoring, and results-based governance
- Support evaluation of resource allocation and staffing patterns, linking manpower needs to statistical outputs and national policy requirements
- Review and validate analytical reports, reform recommendations, economic rationale notes, policy briefs
- Facilitate high-level consultations with senior officials and stakeholders
- Provide intellectual leadership ensuring analytical rigor, economic clarity, and alignment with the study's ToR`,
      eligibilityCriteria: `Qualification: Post-Graduate Degree in Economics/Applied Economics/Business Economics/Econometrics from a Government recognized University or Institute (regular degree).
Experience: (I) Minimum 20 years of experience in economic statistics, macroeconomic analysis, and policy-related roles in economic/finance units of Government of India, with exposure to national indicators such as GDP, IIP, CPI, and labour statistics. (II) Should have held senior leadership roles (Level 14 & above) involving analytical supervision, publication of official statistics, and inter-ministerial coordination on economic & statistical data systems.`,
      minQualification: 'PG in Economics/Applied Economics/Business Economics/Econometrics',
      qualificationDetails: 'Post-Graduate Degree in Economics/Applied Economics/Business Economics/Econometrics from a recognized University (regular degree)',
      minExperienceYears: 20,
      maxAge: 65,
      specificRequirements: 'Level 14 & above leadership roles in GoI economic/finance units preferred.',
      remunerationMin: 10000,
      remunerationMax: 10000,
      remunerationBasis: 'DAILY',
      remunerationNote: 'Rs 10,000/- per man-day. Contract period: 30 man-days (extendable).',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-16'),
      publishDate: new Date('2026-02-02'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' The selected candidate should carry own laptop.',
      workingHoursNote: 'Part-time: As per engagement schedule (max 30 man-days)',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // Adv/03 — Project Advisor (Digital Transformation)
    {
      advertNumber: 'NPC/HQ/HRM/107/Adv03',
      title: 'Project Advisor (Digital Transformation) - Organisational Study, HRM Group',
      description: `HRM Group at NPC HQ, New Delhi invites applications for 1 Project Advisor (Digital Transformation) for an Organisational Study project. Part-time contractual engagement for 60 man-days (extendable). Advisory role only — no implementation responsibilities.`,
      requisitionType: 'PROJECT',
      projectName: 'NPC Organisational Study',
      designation: 'ADVISOR_CONTRACT',
      engagementType: 'PART_TIME',
      numberOfPosts: 1,
      placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id,
      domainId: itDomain?.id,
      functionalRole: 'Project Advisor (Digital Transformation)',
      workResponsibilities: `- Advisory role post-BPR/OD: Review NPC's Business Process Reengineering (BPR), delayering and organisation design (OD) outputs; provide expert guidance on digital implications and opportunities (no implementation responsibility)
- Benchmarking & best practices: Conduct targeted benchmarking with national/international e-governance models to inform workflow redesign, interoperability, data governance, security, role-based access, and auditability standards
- Workflow redesign guidance: Translate As-Is to To-Be into advisory guidance for digital-ready workflows — clarifying handoffs, approvals, SLAs/TATs, routing logic, and maker-checker controls
- Digitisation opportunities (advisory): Identify and prioritise opportunities for digitisation/automation (DMS, case/workflow systems, RPA/OCR, dashboards, low-code) strictly as recommendations
- Digital readiness assessment: Assess people, process, data, and technology readiness and outline risk, change-management, and capacity-building measures
- Efficiency & delivery impact: Quantify potential efficiency/productivity gains, service-level improvements, risk reduction, and transparency benefits
- Provide a Digital Transformation Roadmap (quick wins → medium-term → long-term) that is implementation-agnostic
- Contribute functional/operational specifications (BRD-level inputs) for downstream solutioning
- Recommend governance mechanisms for future implementation (steering structures, roles, RACI, assurance, SLA concepts)
- Quality assurance of deliverables: Review BPR/OD artefacts and advisory outputs
- Scope boundary: The Advisor will NOT plan or execute implementation activities`,
      eligibilityCriteria: `Qualification: B.E./B.Tech/M.E./M.Tech in Computer Science/IT/Electronics/Data Science, OR MBA/PGDM (IT/Systems/Operations/Digital Transformation), OR Postgraduate degree in Management/Public Policy/e-Governance/Information Systems from a recognized University (regular degree).
Essential Experience: 8-15 years of advisory experience in digital transformation, e-governance, and workflow digitisation, including reviewing BPR/OD outputs and providing guidance on digital-ready workflows, automation opportunities, efficiency improvements, and routing logic (without implementation responsibilities).
Desirable Skills: Strong skills in analysing As-Is/To-Be workflows, benchmarking digital governance models, identifying digitisation opportunities (DMS, workflow systems, low-code, RPA/OCR), assessing digital readiness, and developing functional-level specifications and roadmap options.`,
      minQualification: 'B.E./B.Tech/M.Tech in CS/IT OR MBA/PGDM in IT/Digital Transformation OR PG in e-Governance',
      qualificationDetails: 'B.E./B.Tech/M.E./M.Tech in CS/IT/Electronics/Data Science OR MBA/PGDM (IT/Systems/Digital Transformation) OR PG in Management/Public Policy/e-Governance',
      minExperienceYears: 8,
      maxAge: 65,
      desirableSkills: 'As-Is/To-Be workflow analysis, digital governance benchmarking, DMS/workflow systems, low-code/RPA/OCR, digital readiness assessment, functional specifications',
      remunerationMin: 10000,
      remunerationMax: 10000,
      remunerationBasis: 'DAILY',
      remunerationNote: 'Rs 10,000/- per man-day. Contract period: 60 man-days (extendable).',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-16'),
      publishDate: new Date('2026-02-02'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' The selected candidate should carry own laptop.',
      workingHoursNote: 'Part-time: As per engagement schedule (max 60 man-days)',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // SE/04 — Senior Executive
    {
      advertNumber: 'NPC/HQ/HRM/107/SE04',
      title: 'Senior Executive (Data Analytics & Survey) - Organisational Study, HRM Group',
      description: `HRM Group at NPC HQ, New Delhi invites applications for 2 Senior Executive posts for an Organisational Study project. Full-time contractual engagement for 6 months (extendable).`,
      requisitionType: 'PROJECT',
      projectName: 'NPC Organisational Study',
      designation: 'SENIOR_PROFESSIONAL',
      engagementType: 'FULL_TIME',
      numberOfPosts: 2,
      placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id,
      domainId: hrmDomain?.id,
      functionalRole: 'Senior Executive',
      workResponsibilities: `- Support the organisational study by conducting structured research and analytical work, including assessment of existing organisational structures, workflows, staffing patterns, and reporting mechanisms
- Collect, compile, and validate data through document review, stakeholder interactions, interviews, and field visits, ensuring accuracy and completeness
- Assist in developing key analytical outputs such as organisation charts, functional mapping, process maps, workload analysis, issue logs, and identification of pain points or duplication
- Support work-measurement studies by gathering quantitative and qualitative inputs necessary for manpower analysis, performance norms, and administrative/technical workload assessments
- Prepare structured documentation including meeting minutes, consultation summaries, analytical notes, and draft sections of diagnostic and final reports
- Contribute to identification of opportunities for process improvement, delayering, rationalisation, and enhanced coordination
- Assist in preparation of presentations, reform options, dashboards, and final submission documents for senior-level reviews
- Ensure systematic documentation, version control, data management, and timely coordination with team members`,
      eligibilityCriteria: `Qualification: Master's degree in Economics/Finance/Statistics/Management/MSW (Social Work)/related subject OR B.E/B.Tech in any discipline. Degree acquired on regular basis from a Government recognized University or Institute.
Experience: (I) Minimum two years of work experience in Data analytics, Survey design/management, etc. (II) Prior experience in Data analytics, Survey design, survey execution/management, sampling, research methodology will be preferred.`,
      minQualification: 'Master\'s in Economics/Finance/Statistics/Management/MSW OR B.E/B.Tech',
      qualificationDetails: 'Master\'s degree in Economics/Finance/Statistics/Management/MSW/related subject OR B.E/B.Tech in any discipline (regular degree)',
      minExperienceYears: 2,
      maxAge: 65,
      desirableSkills: 'Data analytics, survey design, survey execution/management, sampling, research methodology',
      remunerationMin: 33000,
      remunerationMax: 50000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 33,000-42,000/month (up to 6 yrs exp); Rs 50,000/month (6+ yrs exp)',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-16'),
      publishDate: new Date('2026-02-02'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' The selected candidate should carry own laptop. No laptop/desktop will be provided by the Organization.',
      workingHoursNote: 'Normal office timings',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },

    // PE/05 — Project Executive
    {
      advertNumber: 'NPC/HQ/HRM/107/PE05',
      title: 'Project Executive - Organisational Study, HRM Group',
      description: `HRM Group at NPC HQ, New Delhi invites applications for 4 Project Executive posts for an Organisational Study project. Full-time contractual engagement for 6 months (extendable).`,
      requisitionType: 'PROJECT',
      projectName: 'NPC Organisational Study',
      designation: 'PROJECT_EXECUTIVE',
      engagementType: 'FULL_TIME',
      numberOfPosts: 4,
      placeOfDeployment: 'HRM Group, NPC HQ, New Delhi',
      officeId: hqOffice?.id,
      domainId: hrmDomain?.id,
      functionalRole: 'Project Executive',
      workResponsibilities: `- Collect organisational, staffing, workflow, and process-related data from various divisions and field offices through document review, stakeholder interactions, and field visits
- Assist in work-measurement studies by gathering quantitative and qualitative inputs related to workload, process steps, timelines, and manpower deployment
- Support development of organisation charts, functional maps, process maps, workload assessments, issue logs, and duplication/pain-point analyses
- Compile, organise, and validate data required for assessing reporting structures, functional responsibilities, and administrative/technical processes
- Assist in identifying opportunities for delayering, rationalization, simplification of procedures, enhancing coordination, and improving efficiency
- Draft structured documentation including progress updates, meeting notes, analytical write-ups, annexures, and inputs for diagnostic and final reports
- Contribute to preparation of presentations, data summaries, comparative analyses, and documentation packs for senior-level reviews
- Ensure systematic record management, version control, and coordination with team members
- Provide operational support during consultations, interviews, workshops, and interactions with various units and stakeholders`,
      eligibilityCriteria: `Qualification: B.E/B.Tech in any discipline. Degree acquired on regular basis from a Government recognized University or Institute. Desirable: Master's degree in Economics/Finance/Statistics/Management/related subject.
Experience: (I) 1-5 years of work experience in project execution, coordination, reporting, stakeholder management. (II) Government consulting/process documentation. Prior experience supporting projects involving Ministries/Departments, PMUs, Survey planning and execution, HR/work study will be preferred.`,
      minQualification: 'B.E / B.Tech in any discipline',
      qualificationDetails: 'B.E/B.Tech in any discipline (regular degree). Desirable: Master\'s in Economics/Finance/Statistics/Management',
      minExperienceYears: 1,
      maxAge: 65,
      desirableSkills: 'Project execution, Government consulting, process documentation, survey planning, HR/work study, stakeholder management',
      remunerationMin: 25000,
      remunerationMax: 37000,
      remunerationBasis: 'MONTHLY',
      remunerationNote: 'Rs 25,000-37,000/- per month depending upon years of relevant experience',
      contractPeriodMonths: 6,
      lastDateToApply: new Date('2026-02-16'),
      publishDate: new Date('2026-02-02'),
      applicationEmail: 'npc036902@gmail.com',
      termsAndConditions: COMMON_TERMS,
      generalConditions: COMMON_GENERAL + ' The selected candidate should carry own laptop. No laptop/desktop will be provided by the Organization.',
      workingHoursNote: 'Normal office timings',
      travelRequired: false,
      status: 'PUBLISHED',
      createdByUserId: adminUser?.id,
    },
  ];

  let created = 0;
  for (const advert of adverts) {
    const existing = await prisma.advert.findUnique({ where: { advertNumber: advert.advertNumber } });
    if (existing) {
      console.log(`  [skip] ${advert.advertNumber} already exists`);
      continue;
    }
    const result = await prisma.advert.create({ data: advert as any });
    console.log(`  [new]  ${result.advertNumber} — ${result.title}`);
    created++;
  }

  console.log(`\nDone! ${created} adverts seeded as PUBLISHED (9 total across 3 advertisements).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
