/**
 * Auto-screening for Empanelment applications.
 *
 * Implements the eligibility matrix from Empanelment AI Section 2.3:
 *
 * | Category            | Criteria                                                                |
 * |---------------------|-------------------------------------------------------------------------|
 * | Advisor             | 20yr Group-A + 10yr Level-12/13; OR Doctorate + 25yr professional       |
 * | Senior Consultant   | 13yr + 5yr Level-12; OR Post-Grad + 13yr professional                   |
 * | Consultant          | 6-13yr experience + Post-Grad/Engineering                               |
 * | Project Associate   | 0-6yr experience + Post-Grad/Engineering                                |
 * | Young Professional  | Professional degree from premier institute, max age 35                  |
 */

import {
  IApplicantProfile,
  IEmpanelmentScreeningResult,
} from '../../types';
import { EmpanelmentCategory, ApplicantBackgroundType } from '../../types/enums';
import { computeProfileValues, ComputedProfile } from './experience-calculator';

/**
 * Check if an applicant qualifies as Advisor.
 * Rule from Empanelment AI Section 2.3:
 *   "Minimum 20 years in Group A with at least 10 years in Level-12/13 or above;
 *    OR from open market with Doctorate and 25 years professional standing"
 */
function checkAdvisor(profile: ComputedProfile, bgType: ApplicantBackgroundType): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const isGovt = bgType === ApplicantBackgroundType.GOVERNMENT_GROUP_A;

  if (isGovt) {
    // Government route
    if (profile.groupAServiceYears >= 20 && profile.level12PlusYears >= 10) {
      reasons.push(
        `Qualifies as Advisor (Govt route): ${profile.groupAServiceYears.toFixed(1)} years Group-A service (≥20), ` +
        `${profile.level12PlusYears.toFixed(1)} years at Level-12+ (≥10).`
      );
      return { eligible: true, reasons };
    }
    reasons.push(
      `Does not meet Advisor (Govt route): needs 20yr Group-A (has ${profile.groupAServiceYears.toFixed(1)}) ` +
      `and 10yr Level-12+ (has ${profile.level12PlusYears.toFixed(1)}).`
    );
    return { eligible: false, reasons };
  }

  // Open market route
  if (profile.hasDoctorate && profile.totalExperienceYears >= 25) {
    reasons.push(
      `Qualifies as Advisor (open market): Doctorate + ${profile.totalExperienceYears.toFixed(1)} years experience (≥25).`
    );
    return { eligible: true, reasons };
  }
  reasons.push(
    `Does not meet Advisor (open market): needs Doctorate (${profile.hasDoctorate ? 'yes' : 'no'}) ` +
    `and 25yr experience (has ${profile.totalExperienceYears.toFixed(1)}).`
  );
  return { eligible: false, reasons };
}

/**
 * Check if an applicant qualifies as Senior Consultant.
 * Rule from Empanelment AI Section 2.3:
 *   "13+ years with at least 5 years in Level-12;
 *    OR from open market with Post Graduation and 13 years professional standing"
 */
function checkSeniorConsultant(profile: ComputedProfile, bgType: ApplicantBackgroundType): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const isGovt = bgType === ApplicantBackgroundType.GOVERNMENT_GROUP_A;

  if (isGovt) {
    if (profile.totalExperienceYears >= 13 && profile.level12PlusYears >= 5) {
      reasons.push(
        `Qualifies as Senior Consultant (Govt): ${profile.totalExperienceYears.toFixed(1)} years total (≥13), ` +
        `${profile.level12PlusYears.toFixed(1)} years Level-12+ (≥5).`
      );
      return { eligible: true, reasons };
    }
    reasons.push(
      `Does not meet Senior Consultant (Govt): needs 13yr total (has ${profile.totalExperienceYears.toFixed(1)}) ` +
      `and 5yr Level-12+ (has ${profile.level12PlusYears.toFixed(1)}).`
    );
    return { eligible: false, reasons };
  }

  // Open market
  if (profile.hasPostGrad && profile.totalExperienceYears >= 13) {
    reasons.push(
      `Qualifies as Senior Consultant (open market): Post-Grad + ${profile.totalExperienceYears.toFixed(1)} years (≥13).`
    );
    return { eligible: true, reasons };
  }
  reasons.push(
    `Does not meet Senior Consultant (open market): needs Post-Grad (${profile.hasPostGrad ? 'yes' : 'no'}) ` +
    `and 13yr experience (has ${profile.totalExperienceYears.toFixed(1)}).`
  );
  return { eligible: false, reasons };
}

/**
 * Check if an applicant qualifies as Consultant.
 * Rule from Empanelment AI Section 2.3:
 *   "6-13 years of experience with Post Graduation/Engineering degree"
 */
function checkConsultant(profile: ComputedProfile): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const hasRequiredDegree = profile.hasPostGrad || profile.highestQualification === 'PROFESSIONAL';

  if (hasRequiredDegree && profile.totalExperienceYears >= 6) {
    reasons.push(
      `Qualifies as Consultant: Post-Grad/Professional degree + ${profile.totalExperienceYears.toFixed(1)} years (≥6).`
    );
    return { eligible: true, reasons };
  }
  reasons.push(
    `Does not meet Consultant: needs Post-Grad/Engineering (${hasRequiredDegree ? 'yes' : 'no'}) ` +
    `and 6-13yr experience (has ${profile.totalExperienceYears.toFixed(1)}).`
  );
  return { eligible: false, reasons };
}

/**
 * Check if an applicant qualifies as Project Associate.
 * Rule from Empanelment AI Section 2.3:
 *   "0-6 years of experience with Post Graduation/Engineering degree"
 */
function checkProjectAssociate(profile: ComputedProfile): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const hasRequiredDegree = profile.hasPostGrad || profile.highestQualification === 'PROFESSIONAL';

  if (hasRequiredDegree && profile.totalExperienceYears < 6) {
    reasons.push(
      `Qualifies as Project Associate: Post-Grad/Professional degree + ${profile.totalExperienceYears.toFixed(1)} years (<6).`
    );
    return { eligible: true, reasons };
  }
  reasons.push(
    `Does not meet Project Associate: needs Post-Grad/Engineering (${hasRequiredDegree ? 'yes' : 'no'}) ` +
    `and 0-6yr experience (has ${profile.totalExperienceYears.toFixed(1)}).`
  );
  return { eligible: false, reasons };
}

/**
 * Check if an applicant qualifies as Young Professional.
 * Rule from Empanelment AI Section 2.3:
 *   "Relevant professional degree from reputed institutions (ISI, IIT, DCS, IIM, etc.)
 *    with maximum age of 35 years"
 */
function checkYoungProfessional(profile: ComputedProfile): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (profile.hasPremierDegree && profile.age <= 35) {
    reasons.push(
      `Qualifies as Young Professional: Premier institute degree + age ${profile.age} (≤35).`
    );
    return { eligible: true, reasons };
  }
  reasons.push(
    `Does not meet Young Professional: needs premier institute degree (${profile.hasPremierDegree ? 'yes' : 'no'}) ` +
    `and age ≤35 (is ${profile.age}).`
  );
  return { eligible: false, reasons };
}

/**
 * Main empanelment auto-screening function.
 *
 * Given an applicant profile with education and experience history,
 * determines the provisional empanelment category per Empanelment AI §2.3.
 * The highest qualifying category is assigned.
 */
export function screenForEmpanelment(
  profile: IApplicantProfile
): IEmpanelmentScreeningResult {
  const computed = computeProfileValues(
    profile.dateOfBirth,
    profile.educations,
    profile.experiences
  );

  const allReasons: string[] = [];
  const qualifiedCategories: EmpanelmentCategory[] = [];

  // Check each category from highest to lowest
  const advisorCheck = checkAdvisor(computed, profile.backgroundType);
  allReasons.push(...advisorCheck.reasons);
  if (advisorCheck.eligible) qualifiedCategories.push(EmpanelmentCategory.ADVISOR);

  const scCheck = checkSeniorConsultant(computed, profile.backgroundType);
  allReasons.push(...scCheck.reasons);
  if (scCheck.eligible) qualifiedCategories.push(EmpanelmentCategory.SENIOR_CONSULTANT);

  const consultantCheck = checkConsultant(computed);
  allReasons.push(...consultantCheck.reasons);
  if (consultantCheck.eligible) qualifiedCategories.push(EmpanelmentCategory.CONSULTANT);

  const paCheck = checkProjectAssociate(computed);
  allReasons.push(...paCheck.reasons);
  if (paCheck.eligible) qualifiedCategories.push(EmpanelmentCategory.PROJECT_ASSOCIATE);

  const ypCheck = checkYoungProfessional(computed);
  allReasons.push(...ypCheck.reasons);
  if (ypCheck.eligible) qualifiedCategories.push(EmpanelmentCategory.YOUNG_PROFESSIONAL);

  const eligible = qualifiedCategories.length > 0;
  const provisionalCategory = eligible ? qualifiedCategories[0] : null;

  if (!eligible) {
    allReasons.push('Applicant does not meet eligibility criteria for any empanelment category.');
  } else {
    allReasons.push(`Provisionally classified as: ${provisionalCategory}.`);
  }

  return {
    eligible,
    provisionalCategory,
    reasons: allReasons,
    computedValues: computed,
    qualifiedCategories,
  };
}
