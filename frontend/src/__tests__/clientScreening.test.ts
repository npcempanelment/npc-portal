/**
 * Unit tests for client-side screening preview utility.
 * Tests computeAge, computeTotalExperience, determineHighestQualification, previewScreening
 */

import { describe, it, expect } from 'vitest';
import {
  computeAge,
  computeTotalExperience,
  determineHighestQualification,
  previewScreening,
} from '../utils/clientScreening';

// ── computeAge ──

describe('computeAge', () => {
  it('should return 0 for empty string', () => {
    expect(computeAge('')).toBe(0);
  });

  it('should compute age for a valid DOB', () => {
    const age = computeAge('1990-01-15');
    const today = new Date();
    const expected = today.getFullYear() - 1990 - (today < new Date(today.getFullYear(), 0, 15) ? 1 : 0);
    expect(age).toBe(expected);
  });

  it('should handle future birthday this year', () => {
    const today = new Date();
    const futureMonth = (today.getMonth() + 6) % 12;
    const birthYear = today.getFullYear() - 25;
    const dobStr = `${birthYear}-${String(futureMonth + 1).padStart(2, '0')}-15`;
    const age = computeAge(dobStr);

    if (futureMonth > today.getMonth() || (futureMonth === today.getMonth() && 15 > today.getDate())) {
      expect(age).toBe(24);
    } else {
      expect(age).toBe(25);
    }
  });
});

// ── computeTotalExperience ──

describe('computeTotalExperience', () => {
  it('should return 0 for empty list', () => {
    expect(computeTotalExperience([])).toBe(0);
  });

  it('should compute single entry', () => {
    const result = computeTotalExperience([
      { startDate: '2020-01-01', endDate: '2023-01-01', isCurrent: false },
    ]);
    expect(result).toBeCloseTo(3.0, 0);
  });

  it('should handle current employment', () => {
    const result = computeTotalExperience([
      { startDate: '2020-01-01', endDate: '', isCurrent: true },
    ]);
    expect(result).toBeGreaterThan(4);
  });

  it('should merge overlapping periods', () => {
    const result = computeTotalExperience([
      { startDate: '2018-01-01', endDate: '2021-06-01', isCurrent: false },
      { startDate: '2020-01-01', endDate: '2023-01-01', isCurrent: false },
    ]);
    // Should be ~5 years (2018-2023), not 6.5
    expect(result).toBeCloseTo(5.0, 0);
  });

  it('should handle non-overlapping periods', () => {
    const result = computeTotalExperience([
      { startDate: '2015-01-01', endDate: '2017-01-01', isCurrent: false },
      { startDate: '2019-01-01', endDate: '2022-01-01', isCurrent: false },
    ]);
    expect(result).toBeCloseTo(5.0, 0);
  });

  it('should filter out entries without startDate', () => {
    const result = computeTotalExperience([
      { startDate: '', endDate: '2023-01-01', isCurrent: false },
      { startDate: '2020-01-01', endDate: '2023-01-01', isCurrent: false },
    ]);
    expect(result).toBeCloseTo(3.0, 0);
  });
});

// ── determineHighestQualification ──

describe('determineHighestQualification', () => {
  it('should detect Doctorate', () => {
    expect(determineHighestQualification([
      { degree: 'Ph.D.', isDoctorate: true, isPostGraduation: false },
    ])).toBe('DOCTORATE');
  });

  it('should detect Post Graduate', () => {
    expect(determineHighestQualification([
      { degree: 'MBA', isDoctorate: false, isPostGraduation: true },
    ])).toBe('POST_GRADUATE');
  });

  it('should detect Professional (B.Tech)', () => {
    expect(determineHighestQualification([
      { degree: 'B.Tech in CS', isDoctorate: false, isPostGraduation: false },
    ])).toBe('PROFESSIONAL');
  });

  it('should detect Professional (MBBS)', () => {
    expect(determineHighestQualification([
      { degree: 'MBBS', isDoctorate: false, isPostGraduation: false },
    ])).toBe('PROFESSIONAL');
  });

  it('should detect Graduate (B.A.)', () => {
    expect(determineHighestQualification([
      { degree: 'B.A. History', isDoctorate: false, isPostGraduation: false },
    ])).toBe('GRADUATE');
  });

  it('should detect Graduate (Bachelor)', () => {
    expect(determineHighestQualification([
      { degree: 'Bachelor of Commerce', isDoctorate: false, isPostGraduation: false },
    ])).toBe('GRADUATE');
  });

  it('should detect ITI', () => {
    expect(determineHighestQualification([
      { degree: 'ITI Fitter', isDoctorate: false, isPostGraduation: false },
    ])).toBe('ITI');
  });

  it('should default to CLASS_XII', () => {
    expect(determineHighestQualification([
      { degree: 'Higher Secondary', isDoctorate: false, isPostGraduation: false },
    ])).toBe('CLASS_XII');
  });

  it('should pick highest from multiple educations', () => {
    expect(determineHighestQualification([
      { degree: 'B.A.', isDoctorate: false, isPostGraduation: false },
      { degree: 'M.A.', isDoctorate: false, isPostGraduation: true },
    ])).toBe('POST_GRADUATE');
  });
});

// ── previewScreening ──

describe('previewScreening', () => {
  it('should show eligible for qualified applicant', () => {
    const result = previewScreening(
      '1990-01-01',
      [{ degree: 'B.Tech', isDoctorate: false, isPostGraduation: false }],
      [{ startDate: '2012-01-01', endDate: '2022-01-01', isCurrent: false }],
      { minExperienceYears: 5, maxAge: 65, minQualification: 'Graduate' }
    );

    expect(result.eligible).toBe(true);
    expect(result.meetsAge).toBe(true);
    expect(result.meetsExperience).toBe(true);
    expect(result.meetsQualification).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect age exceeding max', () => {
    const result = previewScreening(
      '1955-01-01',
      [{ degree: 'B.Tech', isDoctorate: false, isPostGraduation: false }],
      [{ startDate: '1980-01-01', endDate: '2020-01-01', isCurrent: false }],
      { maxAge: 65 }
    );

    expect(result.meetsAge).toBe(false);
    expect(result.eligible).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain('Age');
  });

  it('should detect insufficient experience', () => {
    const result = previewScreening(
      '2000-01-01',
      [{ degree: 'B.Tech', isDoctorate: false, isPostGraduation: false }],
      [{ startDate: '2023-01-01', endDate: '2024-01-01', isCurrent: false }],
      { minExperienceYears: 5 }
    );

    expect(result.meetsExperience).toBe(false);
    expect(result.eligible).toBe(false);
    expect(result.issues.some(i => i.includes('Experience'))).toBe(true);
  });

  it('should detect insufficient qualification', () => {
    const result = previewScreening(
      '1995-01-01',
      [{ degree: 'Higher Secondary', isDoctorate: false, isPostGraduation: false }],
      [{ startDate: '2015-01-01', endDate: '2023-01-01', isCurrent: false }],
      { minQualification: 'Post Graduate' }
    );

    expect(result.meetsQualification).toBe(false);
    expect(result.eligible).toBe(false);
    expect(result.issues.some(i => i.includes('Qualification'))).toBe(true);
  });

  it('should enforce max age 35 for Young Professional', () => {
    const result = previewScreening(
      '1985-01-01',
      [{ degree: 'B.Tech', isDoctorate: false, isPostGraduation: false }],
      [{ startDate: '2010-01-01', endDate: '2023-01-01', isCurrent: false }],
      { designation: 'YOUNG_PROFESSIONAL_CONTRACT' }
    );

    expect(result.meetsAge).toBe(false);
    expect(result.issues.some(i => i.includes('35'))).toBe(true);
  });

  it('should return computed values', () => {
    const result = previewScreening(
      '1990-06-15',
      [{ degree: 'MBA', isDoctorate: false, isPostGraduation: true }],
      [{ startDate: '2015-01-01', endDate: '2023-01-01', isCurrent: false }],
      {}
    );

    expect(result.age).toBeGreaterThan(30);
    expect(result.totalExperience).toBeCloseTo(8, 0);
    expect(result.highestQualification).toBe('POST_GRADUATE');
    expect(result.qualificationLabel).toBe('Post Graduate');
  });
});
