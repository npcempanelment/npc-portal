/**
 * Auto-screening for Contractual Engagement applications.
 *
 * Implements eligibility checks per AI-858/2026:
 * - Annex-II-A: Remuneration matrix for junior designations (experience-graded)
 * - Annex-II-B: Remuneration matrix for senior designations (fixed bands)
 * - §C.1: >80% marks → max remuneration, 60-80% → 90% of max
 * - §C.2.1: Lump sum basis: graduation + 12yr experience
 * - §C.3.1: Revenue sharing: 15yr experience, success fee ≤3%
 * - Max age limit 65 years (Annex-II-B)
 */

import {
  IApplicantProfile,
  IContractualScreeningResult,
} from '../../types';
import { ContractualDesignation, MinQualification, ApplicantBackgroundType } from '../../types/enums';
import { computeProfileValues, ComputedProfile } from './experience-calculator';

// ─────────────────────────────────────────────
// REMUNERATION MATRICES — Rule from AI-858 Annex-II-A
// ─────────────────────────────────────────────

/** Experience-graded monthly remuneration (Rs) — AI-858 Annex-II-A */
const ANNEX_IIA_MATRIX: Record<string, { minQual: MinQualification; remByExpYears: Record<number, number> }> = {
  [ContractualDesignation.SUPPORT_EXECUTIVE]: {
    minQual: MinQualification.CLASS_XII,
    remByExpYears: { 0: 0 }, // As per minimum wages — not in portal scope
  },
  [ContractualDesignation.OFFICE_EXECUTIVE]: {
    minQual: MinQualification.GRADUATE,
    remByExpYears: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  [ContractualDesignation.ACCOUNTS_EXECUTIVE]: {
    minQual: MinQualification.GRADUATE,
    remByExpYears: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  [ContractualDesignation.TECHNICAL_EXECUTIVE]: {
    minQual: MinQualification.ITI,
    remByExpYears: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  [ContractualDesignation.LEGAL_EXECUTIVE]: {
    minQual: MinQualification.LAW,
    remByExpYears: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  [ContractualDesignation.PROJECT_EXECUTIVE]: {
    minQual: MinQualification.GRADUATE,
    remByExpYears: { 0: 28000, 1: 35000, 2: 44000, 3: 50000, 4: 57000, 5: 65000 },
  },
  [ContractualDesignation.RESEARCH_EXECUTIVE]: {
    minQual: MinQualification.GRADUATE,
    remByExpYears: { 0: 28000, 1: 35000, 2: 44000, 3: 50000, 4: 57000, 5: 65000 },
  },
  [ContractualDesignation.SENIOR_PROFESSIONAL]: {
    minQual: MinQualification.POST_GRADUATE,
    remByExpYears: { 0: 34000, 1: 40000, 2: 48000, 3: 55000, 4: 62000, 5: 70000 },
  },
  // Rule from AI-858 Annex-II-A: "max tenure 3 years, max age 35"
  [ContractualDesignation.YOUNG_PROFESSIONAL_CONTRACT]: {
    minQual: MinQualification.PROFESSIONAL,
    remByExpYears: { 0: 60000, 1: 60000 }, // Fixed 60,000
  },
};

/** Fixed monthly/daily remuneration — AI-858 Annex-II-B */
interface AnnexIIBEntry {
  minQual: MinQualification;
  minExpYears: number;
  maxAge: number;
  monthlyFixed: number;
  dailyRate: number;
}

const ANNEX_IIB_MATRIX: Partial<Record<ContractualDesignation, AnnexIIBEntry[]>> = {
  // Two tiers for Consultant: 6yr → 75k, 10yr → 90k
  [ContractualDesignation.CONSULTANT_CONTRACT]: [
    { minQual: MinQualification.GRADUATE, minExpYears: 10, maxAge: 65, monthlyFixed: 90000, dailyRate: 6000 },
    { minQual: MinQualification.GRADUATE, minExpYears: 6, maxAge: 65, monthlyFixed: 75000, dailyRate: 5000 },
  ],
  [ContractualDesignation.SENIOR_CONSULTANT_CONTRACT]: [
    { minQual: MinQualification.GRADUATE, minExpYears: 15, maxAge: 65, monthlyFixed: 110000, dailyRate: 8000 },
  ],
  [ContractualDesignation.ADVISOR_CONTRACT]: [
    { minQual: MinQualification.GRADUATE, minExpYears: 20, maxAge: 65, monthlyFixed: 125000, dailyRate: 10000 },
  ],
  [ContractualDesignation.SENIOR_ADVISOR]: [
    { minQual: MinQualification.DOCTORATE, minExpYears: 20, maxAge: 65, monthlyFixed: 150000, dailyRate: 12000 },
  ],
};

// ─────────────────────────────────────────────
// QUALIFICATION ORDERING (for comparison)
// ─────────────────────────────────────────────

const QUAL_RANK: Record<MinQualification, number> = {
  [MinQualification.CLASS_XII]: 1,
  [MinQualification.ITI]: 2,
  [MinQualification.GRADUATE]: 3,
  [MinQualification.LAW]: 3,
  [MinQualification.POST_GRADUATE]: 4,
  [MinQualification.PROFESSIONAL]: 4,
  [MinQualification.DOCTORATE]: 5,
};

function meetsMinQualification(
  actual: MinQualification,
  required: MinQualification
): boolean {
  return QUAL_RANK[actual] >= QUAL_RANK[required];
}

// ─────────────────────────────────────────────
// SCREENING FOR ANNEX-II-A (junior designations)
// ─────────────────────────────────────────────

function screenAnnexIIA(
  designation: ContractualDesignation,
  computed: ComputedProfile,
  advertMinExp?: number,
  advertMaxAge?: number,
): IContractualScreeningResult {
  const matrix = ANNEX_IIA_MATRIX[designation];
  if (!matrix) {
    return {
      eligible: false,
      reasons: [`No Annex-II-A matrix entry for designation: ${designation}`],
      meetsQualification: false,
      meetsExperience: false,
      meetsAge: true,
      computedValues: { totalExperienceYears: computed.totalExperienceYears, age: computed.age, highestQualification: computed.highestQualification },
    };
  }

  const reasons: string[] = [];
  const qualOk = meetsMinQualification(computed.highestQualification, matrix.minQual);
  if (!qualOk) {
    reasons.push(`Qualification: requires ${matrix.minQual}, applicant has ${computed.highestQualification}.`);
  }

  const minExp = advertMinExp ?? 0;
  const expOk = computed.totalExperienceYears >= minExp;
  if (!expOk) {
    reasons.push(`Experience: requires ${minExp} years, applicant has ${computed.totalExperienceYears.toFixed(1)} years.`);
  }

  // YP: max age 35 — Rule from AI-858 Annex-II-A footnote
  const effectiveMaxAge = designation === ContractualDesignation.YOUNG_PROFESSIONAL_CONTRACT
    ? 35
    : (advertMaxAge ?? 999);
  const ageOk = computed.age <= effectiveMaxAge;
  if (!ageOk) {
    reasons.push(`Age: maximum ${effectiveMaxAge}, applicant is ${computed.age}.`);
  }

  const eligible = qualOk && expOk && ageOk;

  // Determine remuneration band from matrix
  let suggestedBand: { min: number; max: number; basis: string } | undefined;
  if (eligible) {
    const expYearsFloor = Math.min(Math.floor(computed.totalExperienceYears), 5);
    const expKeys = Object.keys(matrix.remByExpYears).map(Number).sort((a, b) => a - b);
    // Find the highest applicable key
    let applicableKey = expKeys[0];
    for (const key of expKeys) {
      if (expYearsFloor >= key) applicableKey = key;
    }
    const maxRem = matrix.remByExpYears[applicableKey];
    if (maxRem > 0) {
      // AI-858 §C.1: max amount at >80% marks; 90% at 60-80%
      suggestedBand = {
        min: Math.round(maxRem * 0.9), // 60-80% marks tier
        max: maxRem,                    // >80% marks tier
        basis: 'MONTHLY',
      };
      reasons.push(
        `Remuneration band (AI-858 §C.1): Rs ${suggestedBand.min.toLocaleString()} - ` +
        `Rs ${suggestedBand.max.toLocaleString()}/month based on ${computed.totalExperienceYears.toFixed(1)} years experience.`
      );
    }
  }

  if (eligible) {
    reasons.push(`Eligible for ${designation} position.`);
  }

  return {
    eligible,
    reasons,
    meetsQualification: qualOk,
    meetsExperience: expOk,
    meetsAge: ageOk,
    computedValues: {
      totalExperienceYears: computed.totalExperienceYears,
      age: computed.age,
      highestQualification: computed.highestQualification,
    },
    suggestedRemunerationBand: suggestedBand,
  };
}

// ─────────────────────────────────────────────
// SCREENING FOR ANNEX-II-B (senior designations)
// ─────────────────────────────────────────────

function screenAnnexIIB(
  designation: ContractualDesignation,
  computed: ComputedProfile,
  advertMinExp?: number,
  advertMaxAge?: number,
): IContractualScreeningResult {
  const entries = ANNEX_IIB_MATRIX[designation];
  if (!entries || entries.length === 0) {
    return {
      eligible: false,
      reasons: [`No Annex-II-B matrix entry for designation: ${designation}`],
      meetsQualification: false,
      meetsExperience: false,
      meetsAge: true,
      computedValues: { totalExperienceYears: computed.totalExperienceYears, age: computed.age, highestQualification: computed.highestQualification },
    };
  }

  const reasons: string[] = [];

  // Try each tier (sorted by experience descending — best match first)
  for (const entry of entries) {
    const qualOk = meetsMinQualification(computed.highestQualification, entry.minQual);
    const effectiveMinExp = advertMinExp ?? entry.minExpYears;
    const expOk = computed.totalExperienceYears >= effectiveMinExp;
    const effectiveMaxAge = advertMaxAge ?? entry.maxAge;
    const ageOk = computed.age <= effectiveMaxAge;

    if (qualOk && expOk && ageOk) {
      reasons.push(
        `Eligible for ${designation}: qualification ${computed.highestQualification} meets ${entry.minQual}, ` +
        `${computed.totalExperienceYears.toFixed(1)} years (≥${effectiveMinExp}), age ${computed.age} (≤${effectiveMaxAge}).`
      );
      reasons.push(
        `Remuneration: Rs ${entry.monthlyFixed.toLocaleString()}/month (fixed) ` +
        `or Rs ${entry.dailyRate.toLocaleString()}/day.`
      );

      return {
        eligible: true,
        reasons,
        meetsQualification: true,
        meetsExperience: true,
        meetsAge: true,
        computedValues: {
          totalExperienceYears: computed.totalExperienceYears,
          age: computed.age,
          highestQualification: computed.highestQualification,
        },
        suggestedRemunerationBand: {
          min: entry.monthlyFixed,
          max: entry.monthlyFixed,
          basis: 'MONTHLY',
        },
      };
    }

    // Collect reasons for failure at this tier
    if (!qualOk) reasons.push(`${designation} tier (${entry.minExpYears}yr+): requires ${entry.minQual}, has ${computed.highestQualification}.`);
    if (!expOk) reasons.push(`${designation} tier (${entry.minExpYears}yr+): requires ${effectiveMinExp} years, has ${computed.totalExperienceYears.toFixed(1)}.`);
    if (!ageOk) reasons.push(`${designation} tier (${entry.minExpYears}yr+): max age ${effectiveMaxAge}, applicant is ${computed.age}.`);
  }

  return {
    eligible: false,
    reasons,
    meetsQualification: false,
    meetsExperience: false,
    meetsAge: computed.age <= 65,
    computedValues: {
      totalExperienceYears: computed.totalExperienceYears,
      age: computed.age,
      highestQualification: computed.highestQualification,
    },
  };
}

// ─────────────────────────────────────────────
// ADVERT CRITERIA INTERFACE
// ─────────────────────────────────────────────

export interface AdvertCriteria {
  designation: ContractualDesignation;
  minQualification?: string;
  minExperienceYears?: number;
  maxAge?: number;
  remunerationMin?: number;
  remunerationMax?: number;
}

// ─────────────────────────────────────────────
// MAIN SCREENING FUNCTION
// ─────────────────────────────────────────────

/**
 * Main contractual auto-screening function.
 *
 * Given an applicant profile and the criteria from a specific advertisement,
 * checks eligibility against AI-858 Annex-II-A/B matrices and returns
 * a result with eligibility status, reasons, and suggested remuneration.
 */
export function screenForContractual(
  profile: IApplicantProfile,
  advertCriteria: AdvertCriteria
): IContractualScreeningResult {
  const computed = computeProfileValues(
    profile.dateOfBirth,
    profile.educations,
    profile.experiences
  );

  const { designation, minExperienceYears, maxAge } = advertCriteria;

  // Determine which matrix to use
  const isAnnexIIA = Object.prototype.hasOwnProperty.call(ANNEX_IIA_MATRIX, designation);
  const isAnnexIIB = Object.prototype.hasOwnProperty.call(ANNEX_IIB_MATRIX, designation);

  if (isAnnexIIA) {
    return screenAnnexIIA(designation, computed, minExperienceYears, maxAge);
  }

  if (isAnnexIIB) {
    return screenAnnexIIB(designation, computed, minExperienceYears, maxAge);
  }

  // Expert (Retired) — AI-858 Annex-II-B row 13
  if (designation === ContractualDesignation.EXPERT_RETIRED) {
    const isRetired =
      profile.backgroundType === ApplicantBackgroundType.GOVERNMENT_GROUP_A ||
      profile.backgroundType === ApplicantBackgroundType.GOVERNMENT_OTHER ||
      profile.backgroundType === ApplicantBackgroundType.CPSE ||
      profile.backgroundType === ApplicantBackgroundType.AUTONOMOUS_BODY;
    if (isRetired) {
      return {
        eligible: true,
        reasons: [
          'Eligible as Expert (Retired): retired from Government/CPSE/Autonomous Body.',
          'Remuneration: 50% of (last Basic Pay + current DA) — fixed thereafter.',
        ],
        meetsQualification: true,
        meetsExperience: true,
        meetsAge: true,
        computedValues: { totalExperienceYears: computed.totalExperienceYears, age: computed.age, highestQualification: computed.highestQualification },
      };
    }
    return {
      eligible: false,
      reasons: ['Expert (Retired) designation requires retired person from Government/CPSE/Autonomous Body/Statutory Body.'],
      meetsQualification: false,
      meetsExperience: false,
      meetsAge: true,
      computedValues: { totalExperienceYears: computed.totalExperienceYears, age: computed.age, highestQualification: computed.highestQualification },
    };
  }

  return {
    eligible: false,
    reasons: [`Unknown designation: ${designation}. No matching eligibility matrix found.`],
    meetsQualification: false,
    meetsExperience: false,
    meetsAge: true,
    computedValues: { totalExperienceYears: computed.totalExperienceYears, age: computed.age, highestQualification: computed.highestQualification },
  };
}

/**
 * Calculate final remuneration based on Selection Committee marks.
 * Rule from AI-858 §C.1:
 *   >80% marks → maximum amount per matrix
 *   60-80% marks → 90% of maximum amount
 *   <60% marks → not eligible
 */
export function calculateRemuneration(
  maxRemuneration: number,
  selectionCommitteeMarksPercent: number
): { finalRemuneration: number; tier: string } {
  if (selectionCommitteeMarksPercent > 80) {
    return { finalRemuneration: maxRemuneration, tier: 'MAX (>80% marks)' };
  }
  if (selectionCommitteeMarksPercent >= 60) {
    return {
      finalRemuneration: Math.round(maxRemuneration * 0.9),
      tier: '90% (60-80% marks)',
    };
  }
  return { finalRemuneration: 0, tier: 'NOT ELIGIBLE (<60% marks)' };
}
