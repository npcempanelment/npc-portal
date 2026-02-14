/**
 * Client-side screening preview.
 * Replicates the backend logic to show applicants their eligibility
 * BEFORE final submission so they can correct data if needed.
 */

// ── Qualification ranking ──
const QUAL_RANK: Record<string, number> = {
  CLASS_XII: 1,
  ITI: 2,
  GRADUATE: 3,
  LAW: 3,
  POST_GRADUATE: 4,
  PROFESSIONAL: 4,
  DOCTORATE: 5,
};

const QUAL_LABELS: Record<string, string> = {
  CLASS_XII: 'Class XII',
  ITI: 'ITI / Diploma',
  GRADUATE: 'Graduate',
  LAW: 'Law Graduate',
  POST_GRADUATE: 'Post Graduate',
  PROFESSIONAL: 'Professional Degree',
  DOCTORATE: 'Doctorate',
};

// ── Age computation ──
export function computeAge(dobStr: string): number {
  if (!dobStr) return 0;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ── Total experience (with overlap merge) ──
interface ExpInput {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export function computeTotalExperience(exps: ExpInput[]): number {
  if (!exps.length) return 0;
  const intervals = exps
    .filter(e => e.startDate)
    .map(e => ({
      start: new Date(e.startDate).getTime(),
      end: e.isCurrent || !e.endDate ? Date.now() : new Date(e.endDate).getTime(),
    }))
    .sort((a, b) => a.start - b.start);

  if (!intervals.length) return 0;

  const merged: { start: number; end: number }[] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end) {
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push(intervals[i]);
    }
  }
  const totalMs = merged.reduce((sum, iv) => sum + (iv.end - iv.start), 0);
  return Math.round((totalMs / (365.25 * 24 * 3600 * 1000)) * 10) / 10;
}

// ── Highest qualification ──
interface EduInput {
  degree: string;
  isDoctorate: boolean;
  isPostGraduation: boolean;
}

export function determineHighestQualification(edus: EduInput[]): string {
  if (edus.some(e => e.isDoctorate)) return 'DOCTORATE';
  if (edus.some(e => e.isPostGraduation)) return 'POST_GRADUATE';
  const profDegrees = ['LLB', 'B.TECH', 'BE', 'BTECH', 'B.E', 'BDS', 'MBBS', 'CA', 'ICWA'];
  if (edus.some(e => profDegrees.some(pd => e.degree.toUpperCase().includes(pd)))) return 'PROFESSIONAL';
  if (edus.some(e => e.degree.toUpperCase().includes('LLB') || e.degree.toUpperCase().includes('LAW'))) return 'LAW';
  if (edus.some(e => ['B.', 'BACHELOR', 'GRADUATE', 'DIPLOMA'].some(k => e.degree.toUpperCase().includes(k)))) return 'GRADUATE';
  if (edus.some(e => ['ITI', 'NCVT', 'SCVT'].some(k => e.degree.toUpperCase().includes(k)))) return 'ITI';
  return 'CLASS_XII';
}

// ── Client-side screening preview ──
export interface ScreeningPreview {
  age: number;
  totalExperience: number;
  highestQualification: string;
  qualificationLabel: string;
  meetsAge: boolean;
  meetsExperience: boolean;
  meetsQualification: boolean;
  eligible: boolean;
  issues: string[];
}

export function previewScreening(
  dob: string,
  educations: EduInput[],
  experiences: ExpInput[],
  advert: { maxAge?: number; minExperienceYears?: number; minQualification?: string; designation?: string }
): ScreeningPreview {
  const age = computeAge(dob);
  const totalExperience = computeTotalExperience(experiences);
  const highestQualification = determineHighestQualification(educations);
  const qualificationLabel = QUAL_LABELS[highestQualification] || highestQualification;

  const issues: string[] = [];

  // Age check
  const effectiveMaxAge = advert.designation === 'YOUNG_PROFESSIONAL_CONTRACT' ? 35 : (advert.maxAge || 65);
  const meetsAge = !dob ? true : age <= effectiveMaxAge;
  if (!meetsAge) {
    issues.push(`Age: Your age is ${age} years, but the maximum allowed is ${effectiveMaxAge} years.`);
  }

  // Experience check
  const minExp = advert.minExperienceYears || 0;
  const meetsExperience = totalExperience >= minExp;
  if (!meetsExperience) {
    issues.push(`Experience: You have ${totalExperience} years, but the minimum required is ${minExp} years.`);
  }

  // Qualification check (simplified — checks rank if advert specifies minQualification)
  let meetsQualification = true;
  if (advert.minQualification) {
    // Try to map advert minQualification text to a rank key
    const reqKey = mapQualText(advert.minQualification);
    if (reqKey && QUAL_RANK[reqKey] && QUAL_RANK[highestQualification]) {
      meetsQualification = QUAL_RANK[highestQualification] >= QUAL_RANK[reqKey];
      if (!meetsQualification) {
        issues.push(`Qualification: Required "${advert.minQualification}", your highest is "${qualificationLabel}".`);
      }
    }
  }

  const eligible = meetsAge && meetsExperience && meetsQualification;

  return { age, totalExperience, highestQualification, qualificationLabel, meetsAge, meetsExperience, meetsQualification, eligible, issues };
}

function mapQualText(text: string): string | null {
  const t = text.toUpperCase();
  if (t.includes('DOCTOR') || t.includes('PH.D') || t.includes('PHD')) return 'DOCTORATE';
  if (t.includes('POST') || t.includes('MASTER') || t.includes('M.')) return 'POST_GRADUATE';
  if (t.includes('B.TECH') || t.includes('MBBS') || t.includes('CA ') || t.includes('PROFESSIONAL')) return 'PROFESSIONAL';
  if (t.includes('LAW') || t.includes('LLB')) return 'LAW';
  if (t.includes('GRADUAT') || t.includes('BACHELOR') || t.includes('B.')) return 'GRADUATE';
  if (t.includes('ITI') || t.includes('DIPLOMA')) return 'ITI';
  if (t.includes('XII') || t.includes('12TH') || t.includes('INTER')) return 'CLASS_XII';
  return null;
}
