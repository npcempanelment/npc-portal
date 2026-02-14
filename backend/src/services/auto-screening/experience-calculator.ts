/**
 * Experience & profile computation utilities.
 * Computes derived values from applicant profile data used by both
 * empanelment and contractual screening.
 */

import { IExperience, IEducation } from '../../types';
import { MinQualification } from '../../types/enums';

export interface ComputedProfile {
  totalExperienceYears: number;
  groupAServiceYears: number;
  level12PlusYears: number;
  age: number;
  hasDoctorate: boolean;
  hasPostGrad: boolean;
  hasPremierDegree: boolean;
  highestQualification: MinQualification;
}

/**
 * Compute total professional experience in years from a list of experience entries.
 * Overlapping periods are merged to avoid double-counting.
 */
export function computeTotalExperience(experiences: IExperience[]): number {
  if (experiences.length === 0) return 0;

  // Build date intervals and merge overlaps
  const intervals = experiences.map((exp) => ({
    start: new Date(exp.startDate).getTime(),
    end: exp.endDate ? new Date(exp.endDate).getTime() : Date.now(),
  }));

  intervals.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end) {
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push(intervals[i]);
    }
  }

  const totalMs = merged.reduce((sum, iv) => sum + (iv.end - iv.start), 0);
  return totalMs / (365.25 * 24 * 60 * 60 * 1000);
}

/**
 * Compute years of Group-A service (or equivalent).
 * Rule from Empanelment AI Section 2.3 — "years in Group A"
 */
export function computeGroupAYears(experiences: IExperience[]): number {
  const groupAExps = experiences.filter((e) => e.isGroupAService);
  return computeTotalExperience(groupAExps);
}

/**
 * Compute years at Pay Level 12 or above.
 * Rule from Empanelment AI Section 2.3 — "at least 10 years in Level-12/13 or above"
 */
export function computeLevel12PlusYears(experiences: IExperience[]): number {
  const level12Exps = experiences.filter((e) => e.isLevel12OrAbove);
  return computeTotalExperience(level12Exps);
}

/**
 * Compute age in completed years from date of birth.
 * Used for: Empanelment AI §2.3 YP max age 35; AI-858 Annex-II-B max age 65
 */
export function computeAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Determine highest qualification from education list.
 * Maps to MinQualification enum used in eligibility checks.
 */
export function determineHighestQualification(
  educations: IEducation[]
): MinQualification {
  if (educations.some((e) => e.isDoctorate)) return MinQualification.DOCTORATE;
  if (educations.some((e) => e.isPostGraduation))
    return MinQualification.POST_GRADUATE;
  // Check for professional degrees (law, engineering, CA, etc.)
  const professionalDegrees = ['LLB', 'B.TECH', 'BE', 'BTECH', 'B.E', 'BDS', 'MBBS', 'CA', 'ICWA'];
  if (
    educations.some((e) =>
      professionalDegrees.some((pd) =>
        e.degree.toUpperCase().includes(pd)
      )
    )
  ) {
    return MinQualification.PROFESSIONAL;
  }
  // Check for law degree
  if (
    educations.some(
      (e) =>
        e.degree.toUpperCase().includes('LLB') ||
        e.degree.toUpperCase().includes('LAW')
    )
  ) {
    return MinQualification.LAW;
  }
  // Check for graduate
  if (
    educations.some(
      (e) =>
        e.degree.toUpperCase().includes('B.') ||
        e.degree.toUpperCase().includes('BACHELOR') ||
        e.degree.toUpperCase().includes('GRADUATE') ||
        e.degree.toUpperCase().includes('DIPLOMA')
    )
  ) {
    return MinQualification.GRADUATE;
  }
  // Check for ITI
  if (
    educations.some(
      (e) =>
        e.degree.toUpperCase().includes('ITI') ||
        e.degree.toUpperCase().includes('NCVT') ||
        e.degree.toUpperCase().includes('SCVT')
    )
  ) {
    return MinQualification.ITI;
  }
  return MinQualification.CLASS_XII;
}

/**
 * Compute all derived values from an applicant profile.
 */
export function computeProfileValues(
  dateOfBirth: Date,
  educations: IEducation[],
  experiences: IExperience[]
): ComputedProfile {
  return {
    totalExperienceYears: Math.round(computeTotalExperience(experiences) * 100) / 100,
    groupAServiceYears: Math.round(computeGroupAYears(experiences) * 100) / 100,
    level12PlusYears: Math.round(computeLevel12PlusYears(experiences) * 100) / 100,
    age: computeAge(dateOfBirth),
    hasDoctorate: educations.some((e) => e.isDoctorate),
    hasPostGrad: educations.some((e) => e.isPostGraduation),
    hasPremierDegree: educations.some((e) => e.isPremierInstitute),
    highestQualification: determineHighestQualification(educations),
  };
}
