/**
 * Unit tests for contractual-screening.ts
 * Tests auto-screening per AI-858 Annex-II-A/B matrices
 */

import { screenForContractual, calculateRemuneration } from '../services/auto-screening/contractual-screening';
import { ContractualDesignation, MinQualification, ApplicantBackgroundType } from '../types/enums';
import { IApplicantProfile } from '../types';

function makeProfile(overrides: Partial<IApplicantProfile> = {}): IApplicantProfile {
  return {
    userId: 'test-user',
    fullName: 'Test Applicant',
    dateOfBirth: new Date('1990-01-01'),
    contactNumbers: ['9876543210'],
    backgroundType: ApplicantBackgroundType.PRIVATE_SECTOR,
    educations: [
      { degree: 'B.Tech', field: 'CS', institution: 'IIT Delhi', yearOfPassing: 2012, isPremierInstitute: true, isDoctorate: false, isPostGraduation: false },
    ],
    experiences: [
      {
        organization: 'Tech Corp', designation: 'Software Engineer',
        startDate: new Date('2012-07-01'), endDate: new Date('2020-07-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
    ],
    ...overrides,
  };
}

// ── screenForContractual — Annex-II-A ──

describe('screenForContractual — Annex-II-A', () => {
  it('should approve an eligible Office Executive', () => {
    const profile = makeProfile();
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.OFFICE_EXECUTIVE,
      minExperienceYears: 3,
    });

    expect(result.eligible).toBe(true);
    expect(result.meetsQualification).toBe(true);
    expect(result.meetsExperience).toBe(true);
    expect(result.meetsAge).toBe(true);
    expect(result.suggestedRemunerationBand).toBeDefined();
    expect(result.suggestedRemunerationBand!.basis).toBe('MONTHLY');
  });

  it('should reject when qualification is insufficient', () => {
    const profile = makeProfile({
      educations: [
        { degree: 'Higher Secondary', field: 'Science', institution: 'CBSE School', yearOfPassing: 2012, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.OFFICE_EXECUTIVE, // Requires GRADUATE
    });

    expect(result.eligible).toBe(false);
    expect(result.meetsQualification).toBe(false);
  });

  it('should reject when experience is insufficient', () => {
    const profile = makeProfile({
      experiences: [
        {
          organization: 'Startup', designation: 'Intern',
          startDate: new Date('2023-01-01'), endDate: new Date('2023-06-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.OFFICE_EXECUTIVE,
      minExperienceYears: 3,
    });

    expect(result.eligible).toBe(false);
    expect(result.meetsExperience).toBe(false);
  });

  it('should enforce max age 35 for Young Professional', () => {
    // Applicant is ~36 years old
    const profile = makeProfile({ dateOfBirth: new Date('1990-01-01') });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.YOUNG_PROFESSIONAL_CONTRACT,
    });

    expect(result.meetsAge).toBe(false);
    expect(result.eligible).toBe(false);
  });

  it('should approve young applicant for Young Professional', () => {
    const profile = makeProfile({
      dateOfBirth: new Date('2000-01-01'),
      educations: [
        { degree: 'B.Tech', field: 'CS', institution: 'IIT', yearOfPassing: 2022, isPremierInstitute: true, isDoctorate: false, isPostGraduation: false },
      ],
      experiences: [
        {
          organization: 'Google', designation: 'SDE',
          startDate: new Date('2022-07-01'), endDate: new Date('2024-07-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.YOUNG_PROFESSIONAL_CONTRACT,
    });

    expect(result.meetsAge).toBe(true);
    expect(result.meetsQualification).toBe(true);
  });

  it('should approve Senior Professional with post-graduate qualification', () => {
    const profile = makeProfile({
      educations: [
        { degree: 'MBA', field: 'Finance', institution: 'IIM', yearOfPassing: 2015, isPremierInstitute: true, isDoctorate: false, isPostGraduation: true },
      ],
      experiences: [
        {
          organization: 'Big4', designation: 'Senior Manager',
          startDate: new Date('2015-07-01'), endDate: new Date('2023-07-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.SENIOR_PROFESSIONAL,
      minExperienceYears: 5,
    });

    expect(result.eligible).toBe(true);
    expect(result.meetsQualification).toBe(true);
  });

  it('should compute correct remuneration band for 5+ years experience', () => {
    const profile = makeProfile();
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.OFFICE_EXECUTIVE,
    });

    expect(result.eligible).toBe(true);
    // 8 years experience, capped at 5 → Rs 55,000 max
    expect(result.suggestedRemunerationBand).toBeDefined();
    expect(result.suggestedRemunerationBand!.max).toBe(55000);
    expect(result.suggestedRemunerationBand!.min).toBe(49500); // 90% of 55000
  });
});

// ── screenForContractual — Annex-II-B ──

describe('screenForContractual — Annex-II-B', () => {
  it('should approve an eligible Consultant with 10+ years experience', () => {
    const profile = makeProfile({
      experiences: [
        {
          organization: 'Major Corp', designation: 'Principal Consultant',
          startDate: new Date('2010-01-01'), endDate: new Date('2024-01-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.CONSULTANT_CONTRACT,
    });

    expect(result.eligible).toBe(true);
    expect(result.suggestedRemunerationBand).toBeDefined();
    expect(result.suggestedRemunerationBand!.max).toBe(90000);
  });

  it('should approve Consultant with 6-10 years at lower tier', () => {
    const profile = makeProfile({
      experiences: [
        {
          organization: 'Corp', designation: 'Consultant',
          startDate: new Date('2017-01-01'), endDate: new Date('2024-01-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.CONSULTANT_CONTRACT,
    });

    expect(result.eligible).toBe(true);
    expect(result.suggestedRemunerationBand!.max).toBe(75000);
  });

  it('should reject Consultant with insufficient experience', () => {
    const profile = makeProfile({
      experiences: [
        {
          organization: 'Startup', designation: 'Junior',
          startDate: new Date('2021-01-01'), endDate: new Date('2024-01-01'),
          isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.CONSULTANT_CONTRACT,
    });

    expect(result.eligible).toBe(false);
  });

  it('should reject when age exceeds 65 for Annex-II-B', () => {
    const profile = makeProfile({
      dateOfBirth: new Date('1955-01-01'),
      experiences: [
        {
          organization: 'Government', designation: 'Director',
          startDate: new Date('1980-01-01'), endDate: new Date('2020-01-01'),
          isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.SENIOR_ADVISOR,
      maxAge: 65,
    });

    expect(result.eligible).toBe(false);
    expect(result.meetsAge).toBe(false);
  });

  it('should approve Senior Advisor with doctorate and 20+ years', () => {
    const profile = makeProfile({
      dateOfBirth: new Date('1970-01-01'),
      educations: [
        { degree: 'Ph.D.', field: 'Economics', institution: 'JNU', yearOfPassing: 2000, isPremierInstitute: false, isDoctorate: true, isPostGraduation: false },
      ],
      experiences: [
        {
          organization: 'Government', designation: 'Economic Advisor',
          startDate: new Date('2000-01-01'), endDate: new Date('2024-01-01'),
          isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.SENIOR_ADVISOR,
    });

    expect(result.eligible).toBe(true);
    expect(result.suggestedRemunerationBand!.max).toBe(150000);
  });
});

// ── Expert (Retired) ──

describe('screenForContractual — Expert Retired', () => {
  it('should approve retired government officer', () => {
    const profile = makeProfile({
      backgroundType: ApplicantBackgroundType.GOVERNMENT_GROUP_A,
      dateOfBirth: new Date('1960-01-01'),
      experiences: [
        {
          organization: 'Government of India', designation: 'Joint Secretary',
          startDate: new Date('1985-01-01'), endDate: new Date('2020-01-01'),
          isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
        },
      ],
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.EXPERT_RETIRED,
    });

    expect(result.eligible).toBe(true);
    expect(result.reasons.some(r => r.includes('Expert (Retired)'))).toBe(true);
  });

  it('should reject non-retired private sector person', () => {
    const profile = makeProfile({
      backgroundType: ApplicantBackgroundType.PRIVATE_SECTOR,
    });
    const result = screenForContractual(profile, {
      designation: ContractualDesignation.EXPERT_RETIRED,
    });

    expect(result.eligible).toBe(false);
  });
});

// ── calculateRemuneration ──

describe('calculateRemuneration', () => {
  it('should give max remuneration for >80% marks', () => {
    const result = calculateRemuneration(90000, 85);
    expect(result.finalRemuneration).toBe(90000);
    expect(result.tier).toContain('MAX');
  });

  it('should give 90% for 60-80% marks', () => {
    const result = calculateRemuneration(90000, 70);
    expect(result.finalRemuneration).toBe(81000);
    expect(result.tier).toContain('90%');
  });

  it('should give 0 for <60% marks', () => {
    const result = calculateRemuneration(90000, 50);
    expect(result.finalRemuneration).toBe(0);
    expect(result.tier).toContain('NOT ELIGIBLE');
  });

  it('should handle boundary at exactly 80%', () => {
    const result = calculateRemuneration(100000, 80);
    expect(result.finalRemuneration).toBe(90000); // 90% tier (60-80)
  });

  it('should handle boundary at exactly 60%', () => {
    const result = calculateRemuneration(100000, 60);
    expect(result.finalRemuneration).toBe(90000); // 90% tier (60-80)
  });
});
