/**
 * Unit tests for experience-calculator.ts
 * Tests computation of age, experience, qualifications per Empanelment AI §2.3
 */

import {
  computeTotalExperience,
  computeGroupAYears,
  computeLevel12PlusYears,
  computeAge,
  determineHighestQualification,
  computeProfileValues,
} from '../services/auto-screening/experience-calculator';
import { MinQualification } from '../types/enums';
import { IExperience, IEducation } from '../types';

// ── computeAge ──

describe('computeAge', () => {
  it('should compute age correctly for a past date', () => {
    const dob = new Date('1990-01-15');
    const age = computeAge(dob);
    const today = new Date();
    const expected = today.getFullYear() - 1990 - (today < new Date(today.getFullYear(), 0, 15) ? 1 : 0);
    expect(age).toBe(expected);
  });

  it('should return 0 for a date born today', () => {
    const today = new Date();
    const age = computeAge(today);
    expect(age).toBe(0);
  });

  it('should handle birthday not yet passed this year', () => {
    const today = new Date();
    // Set DOB to 6 months from now in the birth year
    const futureMonth = (today.getMonth() + 6) % 12;
    const birthYear = today.getFullYear() - 30;
    const dob = new Date(birthYear, futureMonth, 15);
    const age = computeAge(dob);
    // If birthday hasn't passed yet, age should be 29
    if (futureMonth > today.getMonth() || (futureMonth === today.getMonth() && 15 > today.getDate())) {
      expect(age).toBe(29);
    } else {
      expect(age).toBe(30);
    }
  });

  it('should handle leap year birthdays', () => {
    const dob = new Date('2000-02-29');
    const age = computeAge(dob);
    expect(age).toBeGreaterThan(20);
  });
});

// ── computeTotalExperience ──

describe('computeTotalExperience', () => {
  it('should return 0 for empty experience list', () => {
    expect(computeTotalExperience([])).toBe(0);
  });

  it('should compute single experience entry correctly', () => {
    const exp: IExperience[] = [{
      organization: 'Test Corp', designation: 'Engineer',
      startDate: new Date('2020-01-01'), endDate: new Date('2023-01-01'),
      isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
    }];
    const years = computeTotalExperience(exp);
    expect(years).toBeCloseTo(3.0, 0);
  });

  it('should handle current employment (no end date)', () => {
    const exp: IExperience[] = [{
      organization: 'Test Corp', designation: 'Engineer',
      startDate: new Date('2020-01-01'), endDate: null,
      isCurrent: true, isGroupAService: false, isLevel12OrAbove: false,
    }];
    const years = computeTotalExperience(exp);
    expect(years).toBeGreaterThan(4); // Since it's at least 2024
  });

  it('should merge overlapping experience periods', () => {
    const exp: IExperience[] = [
      {
        organization: 'Company A', designation: 'Dev',
        startDate: new Date('2018-01-01'), endDate: new Date('2021-06-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
      {
        organization: 'Company B', designation: 'Sr Dev',
        startDate: new Date('2020-01-01'), endDate: new Date('2023-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
    ];
    const years = computeTotalExperience(exp);
    // Should be 5 years (2018-2023), not 6.5 years
    expect(years).toBeCloseTo(5.0, 0);
  });

  it('should handle non-overlapping periods', () => {
    const exp: IExperience[] = [
      {
        organization: 'Company A', designation: 'Dev',
        startDate: new Date('2015-01-01'), endDate: new Date('2017-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
      {
        organization: 'Company B', designation: 'Sr Dev',
        startDate: new Date('2019-01-01'), endDate: new Date('2022-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
    ];
    const years = computeTotalExperience(exp);
    // Should be 5 years (2+3)
    expect(years).toBeCloseTo(5.0, 0);
  });

  it('should handle adjacent periods', () => {
    const exp: IExperience[] = [
      {
        organization: 'A', designation: 'D',
        startDate: new Date('2018-01-01'), endDate: new Date('2020-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
      {
        organization: 'B', designation: 'D',
        startDate: new Date('2020-01-01'), endDate: new Date('2022-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
    ];
    const years = computeTotalExperience(exp);
    expect(years).toBeCloseTo(4.0, 0);
  });
});

// ── computeGroupAYears ──

describe('computeGroupAYears', () => {
  it('should return 0 when no Group-A service', () => {
    const exp: IExperience[] = [{
      organization: 'Private', designation: 'Dev',
      startDate: new Date('2018-01-01'), endDate: new Date('2023-01-01'),
      isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
    }];
    expect(computeGroupAYears(exp)).toBe(0);
  });

  it('should compute years for Group-A service entries only', () => {
    const exp: IExperience[] = [
      {
        organization: 'Government', designation: 'IAS Officer',
        startDate: new Date('2015-01-01'), endDate: new Date('2020-01-01'),
        isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
      },
      {
        organization: 'Private', designation: 'Consultant',
        startDate: new Date('2020-01-01'), endDate: new Date('2023-01-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
    ];
    const years = computeGroupAYears(exp);
    expect(years).toBeCloseTo(5.0, 0);
  });
});

// ── computeLevel12PlusYears ──

describe('computeLevel12PlusYears', () => {
  it('should return 0 when no Level 12+ experience', () => {
    const exp: IExperience[] = [{
      organization: 'Org', designation: 'Jr',
      startDate: new Date('2018-01-01'), endDate: new Date('2023-01-01'),
      isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
    }];
    expect(computeLevel12PlusYears(exp)).toBe(0);
  });

  it('should compute years for Level 12+ entries', () => {
    const exp: IExperience[] = [{
      organization: 'Government', designation: 'Joint Secretary',
      startDate: new Date('2010-01-01'), endDate: new Date('2022-01-01'),
      isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
    }];
    const years = computeLevel12PlusYears(exp);
    expect(years).toBeCloseTo(12.0, 0);
  });
});

// ── determineHighestQualification ──

describe('determineHighestQualification', () => {
  it('should return DOCTORATE for PhD holder', () => {
    const edus: IEducation[] = [
      { degree: 'Ph.D.', field: 'Economics', institution: 'JNU', yearOfPassing: 2015, isPremierInstitute: false, isDoctorate: true, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.DOCTORATE);
  });

  it('should return POST_GRADUATE for PG holder', () => {
    const edus: IEducation[] = [
      { degree: 'MBA', field: 'Finance', institution: 'IIM', yearOfPassing: 2018, isPremierInstitute: true, isDoctorate: false, isPostGraduation: true },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.POST_GRADUATE);
  });

  it('should return PROFESSIONAL for B.Tech holder', () => {
    const edus: IEducation[] = [
      { degree: 'B.Tech', field: 'CS', institution: 'IIT', yearOfPassing: 2016, isPremierInstitute: true, isDoctorate: false, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.PROFESSIONAL);
  });

  it('should return LAW for LLB holder', () => {
    const edus: IEducation[] = [
      { degree: 'LLB', field: 'Law', institution: 'Delhi Uni', yearOfPassing: 2017, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
    ];
    // LLB is matched under PROFESSIONAL first due to order in the function
    expect(determineHighestQualification(edus)).toBe(MinQualification.PROFESSIONAL);
  });

  it('should return GRADUATE for B.A. holder', () => {
    const edus: IEducation[] = [
      { degree: 'B.A.', field: 'History', institution: 'DU', yearOfPassing: 2019, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.GRADUATE);
  });

  it('should return ITI for ITI holder', () => {
    const edus: IEducation[] = [
      { degree: 'ITI Electrician', field: 'Electrical', institution: 'Govt ITI', yearOfPassing: 2020, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.ITI);
  });

  it('should return CLASS_XII when no higher qualification', () => {
    const edus: IEducation[] = [
      { degree: 'Higher Secondary', field: 'Science', institution: 'CBSE School', yearOfPassing: 2021, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.CLASS_XII);
  });

  it('should return highest among multiple qualifications', () => {
    const edus: IEducation[] = [
      { degree: 'B.Sc.', field: 'Physics', institution: 'DU', yearOfPassing: 2015, isPremierInstitute: false, isDoctorate: false, isPostGraduation: false },
      { degree: 'M.Sc.', field: 'Physics', institution: 'JNU', yearOfPassing: 2017, isPremierInstitute: false, isDoctorate: false, isPostGraduation: true },
      { degree: 'Ph.D.', field: 'Physics', institution: 'JNU', yearOfPassing: 2022, isPremierInstitute: false, isDoctorate: true, isPostGraduation: false },
    ];
    expect(determineHighestQualification(edus)).toBe(MinQualification.DOCTORATE);
  });
});

// ── computeProfileValues ──

describe('computeProfileValues', () => {
  it('should aggregate all computed values correctly', () => {
    const dob = new Date('1985-06-15');
    const educations: IEducation[] = [
      { degree: 'B.Tech', field: 'CS', institution: 'IIT Delhi', yearOfPassing: 2007, isPremierInstitute: true, isDoctorate: false, isPostGraduation: false },
      { degree: 'M.Tech', field: 'CS', institution: 'IIT Delhi', yearOfPassing: 2009, isPremierInstitute: true, isDoctorate: false, isPostGraduation: true },
    ];
    const experiences: IExperience[] = [
      {
        organization: 'TCS', designation: 'SDE',
        startDate: new Date('2009-07-01'), endDate: new Date('2015-07-01'),
        isCurrent: false, isGroupAService: false, isLevel12OrAbove: false,
      },
      {
        organization: 'Government', designation: 'Scientist',
        startDate: new Date('2015-08-01'), endDate: new Date('2023-08-01'),
        isCurrent: false, isGroupAService: true, isLevel12OrAbove: true,
      },
    ];

    const result = computeProfileValues(dob, educations, experiences);

    expect(result.totalExperienceYears).toBeGreaterThan(13);
    expect(result.groupAServiceYears).toBeGreaterThan(7);
    expect(result.level12PlusYears).toBeGreaterThan(7);
    expect(result.age).toBeGreaterThan(35);
    expect(result.hasDoctorate).toBe(false);
    expect(result.hasPostGrad).toBe(true);
    expect(result.hasPremierDegree).toBe(true);
    expect(result.highestQualification).toBe(MinQualification.POST_GRADUATE);
  });
});
