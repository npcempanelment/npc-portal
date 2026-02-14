/**
 * AI-858/2026 Designation & Remuneration Data
 *
 * Single source of truth for:
 * - Designation list with salary mapping (Annexure II-A & II-B)
 * - Auto-fill logic for admin advert form
 * - Terms & conditions for full-time vs part-time engagement
 *
 * Used by: HomePage (remuneration tables), AdminAdvertFormPage (auto-fill)
 */

// ── Interfaces ──

export interface SalaryTier {
  minExperience: number;
  label: string;
  monthlyAmount: number;
  dailyAmount?: number;
}

export interface DesignationConfig {
  value: string;
  label: string;
  slNo: number;
  annexure: 'II-A' | 'II-B';
  minQualification: string;
  maxAge: number;
  /** Annex II-A: experience-based sliding scale (years → max Rs/month) */
  salaryByExperience?: Record<number, number>;
  /** Annex II-B: fixed monthly tiers by experience */
  fixedMonthlyTiers?: SalaryTier[];
  /** Min experience years for the designation */
  minExperienceYears: number;
  remunerationNote?: string;
}

// ── AI-858 Annexure II-A (Sl. 1–8): Experience-Based Sliding Scale ──

const ANNEX_IIA: DesignationConfig[] = [
  {
    value: 'SUPPORT_EXECUTIVE', label: 'Support Executive', slNo: 1, annexure: 'II-A',
    minQualification: 'Class XII pass',
    maxAge: 65, minExperienceYears: 0,
    remunerationNote: 'As per minimum wages applicable, preferably from Manpower Agency',
  },
  {
    value: 'OFFICE_EXECUTIVE', label: 'Office Executive / Data Entry Operator', slNo: 2, annexure: 'II-A',
    minQualification: 'Graduate degree in any discipline from a recognized university/institution with knowledge in working on computer',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    value: 'ACCOUNTS_EXECUTIVE', label: 'Accounts Executive', slNo: 3, annexure: 'II-A',
    minQualification: 'Graduate degree in any discipline from a recognized university/institution with knowledge in working on computer',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    value: 'TECHNICAL_EXECUTIVE', label: 'Technical Executive', slNo: 4, annexure: 'II-A',
    minQualification: 'ITI in relevant trade (NCVT/SCVT) OR Diploma in relevant Engineering discipline from a recognized institution',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    value: 'LEGAL_EXECUTIVE', label: 'Legal Executive', slNo: 5, annexure: 'II-A',
    minQualification: 'Degree in Law from a government recognized university',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    value: 'PROJECT_EXECUTIVE', label: 'Project Executive', slNo: 6, annexure: 'II-A',
    minQualification: 'Graduate degree in relevant discipline from a recognized university/institution',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 28000, 1: 35000, 2: 44000, 3: 50000, 4: 57000, 5: 65000 },
  },
  {
    value: 'RESEARCH_EXECUTIVE', label: 'Research Executive', slNo: 6, annexure: 'II-A',
    minQualification: 'Graduate degree in relevant discipline from a recognized university/institution',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 28000, 1: 35000, 2: 44000, 3: 50000, 4: 57000, 5: 65000 },
  },
  {
    value: 'SENIOR_PROFESSIONAL', label: 'Senior Professional', slNo: 7, annexure: 'II-A',
    minQualification: 'Post-graduation in relevant discipline from recognized university; OR Graduate with Intermediate in CA/ICWA; OR MBA in any discipline',
    maxAge: 65, minExperienceYears: 0,
    salaryByExperience: { 0: 34000, 1: 40000, 2: 48000, 3: 55000, 4: 62000, 5: 70000 },
  },
  {
    value: 'YOUNG_PROFESSIONAL_CONTRACT', label: 'Young Professional', slNo: 8, annexure: 'II-A',
    minQualification: 'Professional degree in the relevant field from a reputed institute, preferably from a premier institute (ISI, IIT, DCE, IIM, etc.)',
    maxAge: 35, minExperienceYears: 0,
    salaryByExperience: { 0: 60000, 1: 60000, 2: 60000, 3: 60000, 4: 60000, 5: 60000 },
    remunerationNote: 'Rs 60,000 fixed. Maximum tenure of 3 years. Age limit 35 years.',
  },
];

// ── AI-858 Annexure II-B (Sl. 9–13): Fixed Monthly + Daily Rate ──

const ANNEX_IIB: DesignationConfig[] = [
  {
    value: 'CONSULTANT_CONTRACT', label: 'Consultant', slNo: 9, annexure: 'II-B',
    minQualification: 'Graduate in any discipline from a government recognized university/institution relevant to the work requirement',
    maxAge: 65, minExperienceYears: 6,
    fixedMonthlyTiers: [
      { minExperience: 6, label: '6+ years', monthlyAmount: 75000, dailyAmount: 5000 },
      { minExperience: 10, label: '10+ years', monthlyAmount: 90000, dailyAmount: 6000 },
    ],
  },
  {
    value: 'SENIOR_CONSULTANT_CONTRACT', label: 'Senior Consultant', slNo: 10, annexure: 'II-B',
    minQualification: 'Graduate in any discipline from a government recognized university/institution relevant to the work requirement',
    maxAge: 65, minExperienceYears: 15,
    fixedMonthlyTiers: [
      { minExperience: 15, label: '15+ years', monthlyAmount: 110000, dailyAmount: 8000 },
    ],
  },
  {
    value: 'ADVISOR_CONTRACT', label: 'Advisor', slNo: 11, annexure: 'II-B',
    minQualification: 'Graduate in any discipline from a government recognized university/institution relevant to the work requirement',
    maxAge: 65, minExperienceYears: 20,
    fixedMonthlyTiers: [
      { minExperience: 20, label: '20+ years', monthlyAmount: 125000, dailyAmount: 10000 },
    ],
  },
  {
    value: 'SENIOR_ADVISOR', label: 'Senior Advisor', slNo: 12, annexure: 'II-B',
    minQualification: 'Retired from Government of India from Secretary Level OR Doctorate in relevant discipline from recognized university',
    maxAge: 65, minExperienceYears: 20,
    fixedMonthlyTiers: [
      { minExperience: 20, label: '20+ years', monthlyAmount: 150000, dailyAmount: 12000 },
    ],
    remunerationNote: 'For GoI retired persons, remuneration as per Ministry of Finance rules.',
  },
  {
    value: 'EXPERT_RETIRED', label: 'Expert (Retired)', slNo: 13, annexure: 'II-B',
    minQualification: 'Retired from Government / CPSE / Autonomous Body / Statutory Body',
    maxAge: 65, minExperienceYears: 0,
    remunerationNote: '50% of (last Basic Pay + current DA). Fixed thereafter.',
  },
];

// ── Combined export ──

export const AI_858_DESIGNATIONS: DesignationConfig[] = [...ANNEX_IIA, ...ANNEX_IIB];

// ── Helper Functions ──

export function getDesignationConfig(value: string): DesignationConfig | undefined {
  return AI_858_DESIGNATIONS.find(d => d.value === value);
}

/** For Annex II-A: compute max salary for given experience years */
export function computeAnnexIIASalary(config: DesignationConfig, years: number): number {
  if (!config.salaryByExperience) return 0;
  const capped = Math.min(years, 5);
  return config.salaryByExperience[capped] ?? config.salaryByExperience[5] ?? 0;
}

// ── Terms & Conditions Templates ──

export const FULL_TIME_TERMS = `- Engagement is purely on contract basis and does not confer any right for regular appointment in NPC.
- The contractual person shall not claim benefits/compensation/absorption/regularization under Industrial Disputes Act, 1947 or Contract Labour Act, 1970.
- Normal office timings apply. May be called beyond office hours including holidays for official work without extra remuneration.
- Leave entitlement: 12 days per year on pro-rata basis. Un-availed leave cannot be carried forward nor encashed.
- Performance reviewed annually by GH/RD. Continuation and remuneration increase subject to satisfactory performance as per Annex-IV evaluation matrix.
- Remuneration is all-inclusive. No DA, overtime, transport, accommodation, medical reimbursement, or telephone facility.
- NPC may terminate the contract at any time without notice for unsatisfactory performance or indiscipline.
- The contractual person may leave with 30 days written notice, subject to acceptance by competent authority.
- TA/DA as per NPC rules mapped to equivalent Government Pay Level (7th CPC) per Annex-III.`;

export const PART_TIME_TERMS = `- Engagement is purely on contract basis and does not confer any right for regular appointment in NPC.
- The contractual person shall not claim benefits/compensation/absorption/regularization under Industrial Disputes Act, 1947 or Contract Labour Act, 1970.
- Remuneration on per-day basis for actual days of engagement. Subject to maximum 15 days/month and 90 days in a year.
- Office timing and leave provisions are NOT applicable for part-time engagement.
- Performance reviewed periodically. Continuation subject to satisfactory performance.
- NPC may terminate the contract at any time without notice for unsatisfactory performance or indiscipline.
- The contractual person may leave with 30 days written notice, subject to acceptance by competent authority.
- TA/DA as per NPC rules mapped to equivalent Government Pay Level (7th CPC) per Annex-III.`;

export const COMMON_GENERAL_CONDITIONS = `- Original documents and certificates must be produced at the time of joining, failing which the offer stands withdrawn.
- NPC reserves the right to cancel or withdraw this advertisement at any time without assigning reason.
- All intellectual property created during engagement belongs to NPC.
- Subject to police verification; adverse report leads to immediate termination.
- Subject to provisions of Indian Official Secrets Act, 1923 and NPC's cyber security/IT policy.
- Decision of Director General, NPC is final and binding in all matters.`;

// ── Auto-Fill Logic for Admin Form ──

export interface AutoFillResult {
  remunerationMin: number;
  remunerationMax: number;
  remunerationBasis: string;
  minQualification: string;
  maxAge: number;
  minExperienceYears: number;
  remunerationNote: string;
  termsAndConditions: string;
  workingHoursNote: string;
  generalConditions: string;
}

export function getAutoFillValues(designationValue: string, engagementType: string): AutoFillResult | null {
  const config = getDesignationConfig(designationValue);
  if (!config) return null;

  // Only auto-fill for FULL_TIME and PART_TIME
  if (engagementType !== 'FULL_TIME' && engagementType !== 'PART_TIME') return null;

  // Support Executive and Expert Retired have special rules — no standard auto-fill
  if (designationValue === 'SUPPORT_EXECUTIVE' || designationValue === 'EXPERT_RETIRED') return null;

  const isFullTime = engagementType === 'FULL_TIME';
  const terms = isFullTime ? FULL_TIME_TERMS : PART_TIME_TERMS;
  const workingHours = isFullTime
    ? 'Normal office timings. May be required to work beyond office hours including holidays.'
    : 'Per-day engagement basis. Office timings not applicable.';

  // Annex II-A: experience-based sliding scale
  if (config.annexure === 'II-A' && config.salaryByExperience) {
    if (isFullTime) {
      const salaries = Object.values(config.salaryByExperience);
      return {
        remunerationMin: Math.min(...salaries),
        remunerationMax: Math.max(...salaries),
        remunerationBasis: 'MONTHLY',
        minQualification: config.minQualification,
        maxAge: config.maxAge,
        minExperienceYears: config.minExperienceYears,
        remunerationNote: config.remunerationNote || `As per AI-858/2026 Annexure II-A (Sl. ${config.slNo})`,
        termsAndConditions: terms,
        workingHoursNote: workingHours,
        generalConditions: COMMON_GENERAL_CONDITIONS,
      };
    }
    // Part-time for II-A support roles is unusual; return null for manual entry
    return null;
  }

  // Annex II-B: fixed monthly + daily rate
  if (config.annexure === 'II-B' && config.fixedMonthlyTiers) {
    const tiers = config.fixedMonthlyTiers;
    if (isFullTime) {
      return {
        remunerationMin: tiers[0].monthlyAmount,
        remunerationMax: tiers[tiers.length - 1].monthlyAmount,
        remunerationBasis: 'MONTHLY',
        minQualification: config.minQualification,
        maxAge: config.maxAge,
        minExperienceYears: config.minExperienceYears,
        remunerationNote: config.remunerationNote || `Fixed monthly as per AI-858/2026 Annexure II-B (Sl. ${config.slNo})`,
        termsAndConditions: terms,
        workingHoursNote: workingHours,
        generalConditions: COMMON_GENERAL_CONDITIONS,
      };
    } else {
      // Part-time: daily rate
      const dailyRates = tiers.map(t => t.dailyAmount || 0).filter(r => r > 0);
      return {
        remunerationMin: Math.min(...dailyRates),
        remunerationMax: Math.max(...dailyRates),
        remunerationBasis: 'DAILY',
        minQualification: config.minQualification,
        maxAge: config.maxAge,
        minExperienceYears: config.minExperienceYears,
        remunerationNote: config.remunerationNote || `Daily rate as per AI-858/2026 Annexure II-B (Sl. ${config.slNo}). Max 15 days/month, 90 days/year.`,
        termsAndConditions: terms,
        workingHoursNote: workingHours,
        generalConditions: COMMON_GENERAL_CONDITIONS,
      };
    }
  }

  return null;
}
