/**
 * Core TypeScript interfaces for NPC Portal.
 * Used across services, controllers, and API layer.
 */

import {
  EmpanelmentCategory,
  EmpanelmentArea,
  ContractualDesignation,
  EngagementType,
  ApplicationStatus,
  ApplicantBackgroundType,
  MinQualification,
} from './enums';

// ─────────────────────────────────────────────
// APPLICANT PROFILE INTERFACES
// ─────────────────────────────────────────────

export interface IEducation {
  id?: string;
  degree: string;
  field: string;
  institution: string;
  university?: string;
  yearOfPassing: number;
  grade?: string;
  isPremierInstitute: boolean;  // ISI, IIT, IIM etc. — Empanelment AI §2.3
  isDoctorate: boolean;
  isPostGraduation: boolean;
}

export interface IExperience {
  id?: string;
  organization: string;
  designation: string;
  payBandOrRemuneration?: string;
  dutiesDescription?: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  isGroupAService: boolean;       // Empanelment AI §2.3
  payLevel?: string;              // 7th CPC level
  isLevel12OrAbove: boolean;      // Empanelment AI §2.3 Advisor/Sr Consultant criteria
}

export interface IApplicantProfile {
  id?: string;
  userId: string;
  fullName: string;
  fatherOrMotherOrSpouseName?: string;
  dateOfBirth: Date;
  gender?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  correspondenceAddress?: string;
  permanentAddress?: string;
  contactNumbers: string[];
  photoUrl?: string;
  backgroundType: ApplicantBackgroundType;
  lastOrganization?: string;
  lastDesignation?: string;
  lastPayLevel?: string;
  retirementDate?: Date;
  ppoNumber?: string;
  educations: IEducation[];
  experiences: IExperience[];
}

// ─────────────────────────────────────────────
// AUTO-SCREENING RESULTS
// ─────────────────────────────────────────────

/** Result of empanelment auto-screening — Rule from Empanelment AI Section 2.3 */
export interface IEmpanelmentScreeningResult {
  eligible: boolean;
  provisionalCategory: EmpanelmentCategory | null;
  reasons: string[];
  computedValues: {
    totalExperienceYears: number;
    groupAServiceYears: number;
    level12PlusYears: number;
    age: number;
    hasDoctorate: boolean;
    hasPostGrad: boolean;
    hasPremierDegree: boolean;
  };
  /** All categories the applicant qualifies for, highest first */
  qualifiedCategories: EmpanelmentCategory[];
}

/** Result of contractual auto-screening — Rule from AI-858 Annex-II-A/B */
export interface IContractualScreeningResult {
  eligible: boolean;
  reasons: string[];
  meetsQualification: boolean;
  meetsExperience: boolean;
  meetsAge: boolean;
  computedValues: {
    totalExperienceYears: number;
    age: number;
    highestQualification: MinQualification;
  };
  /** AI-858 §C.1 — remuneration band based on experience and designation */
  suggestedRemunerationBand?: {
    min: number;
    max: number;
    basis: string; // "MONTHLY" | "DAILY"
  };
}

// ─────────────────────────────────────────────
// EMPANELMENT APPLICATION
// ─────────────────────────────────────────────

export interface IEmpanelmentApplicationCreate {
  profileId: string;
  domainId: string;
  subDomainId?: string;
  empanelmentArea: EmpanelmentArea;
  officePreferenceIds: string[]; // NPC office IDs in preference order
}

export interface IEmpanelmentApplication {
  id: string;
  applicationNumber: string;
  profileId: string;
  domainId: string;
  subDomainId?: string;
  empanelmentArea: EmpanelmentArea;
  autoScreenCategory: EmpanelmentCategory | null;
  autoScreenEligible: boolean | null;
  autoScreenReasons: string[];
  computedTotalExpYears: number | null;
  computedGroupAYears: number | null;
  computedLevel12Years: number | null;
  computedAge: number | null;
  status: ApplicationStatus;
  submittedAt: Date | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// CONTRACTUAL APPLICATION
// ─────────────────────────────────────────────

export interface IContractualApplicationCreate {
  profileId: string;
  advertId: string;
}

export interface IContractualApplication {
  id: string;
  applicationNumber: string;
  profileId: string;
  advertId: string;
  autoScreenEligible: boolean | null;
  autoScreenReasons: string[];
  computedTotalExpYears: number | null;
  computedAge: number | null;
  suggestedRemunerationMin: number | null;
  suggestedRemunerationMax: number | null;
  status: ApplicationStatus;
  submittedAt: Date | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// ADVERT — AI-858 Annex-I, Annex-A
// ─────────────────────────────────────────────

export interface IAdvertCreate {
  title: string;
  description?: string;
  requisitionType: 'PROJECT' | 'ADMIN_FINANCE' | 'NEW_PROJECT_IDEAS';
  projectName?: string;
  projectValue?: number;
  domainId?: string;
  officeId?: string;
  designation: ContractualDesignation;
  engagementType: EngagementType;
  numberOfPosts: number;
  placeOfDeployment?: string;
  // Annex-A rich fields
  functionalRole?: string;
  workResponsibilities?: string;
  eligibilityCriteria?: string;
  minQualification?: string;
  qualificationDetails?: string;
  minExperienceYears?: number;
  maxAge?: number;
  specificRequirements?: string;
  desirableSkills?: string;
  remunerationMin?: number;
  remunerationMax?: number;
  remunerationBasis?: string;
  remunerationNote?: string;
  contractPeriodMonths?: number;
  contractStartDate?: Date;
  termsAndConditions?: string;
  workingHoursNote?: string;
  travelRequired?: boolean;
  travelNote?: string;
  lastDateToApply?: Date;
  applicationEmail?: string;
  generalConditions?: string;
}

// ─────────────────────────────────────────────
// COMMITTEE & EVALUATION
// ─────────────────────────────────────────────

export interface IScreeningDecision {
  applicationId: string;
  applicationType: 'EMPANELMENT' | 'CONTRACTUAL';
  decision: 'APPROVED' | 'REJECTED' | 'REFERRED_BACK';
  confirmedCategory?: EmpanelmentCategory;
  remarks?: string;
  meetingId: string;
  decidedByUserId: string;
}

/** Empanelment AI §3.2 — evaluation scoring */
export interface IEvaluationScoreInput {
  applicationId: string;
  applicationType: 'EMPANELMENT' | 'CONTRACTUAL';
  meetingId: string;
  evaluatorUserId: string;
  technicalKnowledge: number;  // 0-100
  communicationSkills: number;
  problemSolving: number;
  npcAlignment: number;
  relevantExperience: number;
  remarks?: string;
}

export interface IEvaluationScoreResult {
  totalScore: number;         // Average of 5 areas, 0-100
  /** AI-858 §C.1 — >80% gets max remuneration, 60-80% gets 90% of max */
  remunerationTier: 'MAX' | 'NINETY_PERCENT' | 'NOT_ELIGIBLE';
}

// ─────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
