/**
 * Shared types for the NPC Portal frontend.
 * Mirrors backend enums and API response shapes.
 */

export enum EmpanelmentCategory {
  ADVISOR = 'ADVISOR',
  SENIOR_CONSULTANT = 'SENIOR_CONSULTANT',
  CONSULTANT = 'CONSULTANT',
  PROJECT_ASSOCIATE = 'PROJECT_ASSOCIATE',
  YOUNG_PROFESSIONAL = 'YOUNG_PROFESSIONAL',
}

export enum EmpanelmentArea {
  CONSULTANCY = 'CONSULTANCY',
  TRAINING = 'TRAINING',
  BOTH = 'BOTH',
}

export enum ApplicantBackgroundType {
  GOVERNMENT_GROUP_A = 'GOVERNMENT_GROUP_A',
  GOVERNMENT_OTHER = 'GOVERNMENT_OTHER',
  CPSE = 'CPSE',
  AUTONOMOUS_BODY = 'AUTONOMOUS_BODY',
  PRIVATE_SECTOR = 'PRIVATE_SECTOR',
  ACADEMIC = 'ACADEMIC',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FRESH_GRADUATE = 'FRESH_GRADUATE',
}

export interface Domain {
  id: string;
  name: string;
  code: string;
  subDomains: SubDomain[];
}

export interface SubDomain {
  id: string;
  name: string;
  domainId: string;
}

export interface NpcOffice {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  university?: string;
  yearOfPassing: number;
  grade?: string;
  isPremierInstitute: boolean;
  isDoctorate: boolean;
  isPostGraduation: boolean;
}

export interface Experience {
  organization: string;
  designation: string;
  payBandOrRemuneration?: string;
  dutiesDescription?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  isGroupAService: boolean;
  payLevel?: string;
  isLevel12OrAbove: boolean;
}

export interface Certification {
  name: string;
  issuingBody: string;
  yearObtained?: number;
  certificateNumber?: string;
}

export interface ScreeningResult {
  eligible: boolean;
  provisionalCategory?: EmpanelmentCategory;
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
  qualifiedCategories: EmpanelmentCategory[];
}

export interface ContractualScreeningResult {
  eligible: boolean;
  reasons: string[];
  meetsQualification: boolean;
  meetsExperience: boolean;
  meetsAge: boolean;
  suggestedRemunerationBand?: {
    min: number;
    max: number;
    basis: string;
  };
}

export interface Advert {
  id: string;
  advertNumber: string;
  title: string;
  description?: string;
  requisitionType: string;
  projectName?: string;
  designation: string;
  engagementType: string;
  numberOfPosts: number;
  placeOfDeployment?: string;
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
  contractStartDate?: string;
  termsAndConditions?: string;
  workingHoursNote?: string;
  travelRequired?: boolean;
  travelNote?: string;
  lastDateToApply?: string;
  publishDate?: string;
  applicationEmail?: string;
  generalConditions?: string;
  status: string;
  domain?: Domain;
  office?: NpcOffice;
  _count?: { applications: number };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
