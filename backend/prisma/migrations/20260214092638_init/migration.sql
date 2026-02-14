-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('APPLICANT', 'ADMIN', 'SCREENING_MEMBER', 'EMPANELMENT_MEMBER', 'SELECTION_MEMBER', 'DG', 'IT_ADMIN');

-- CreateEnum
CREATE TYPE "EmpanelmentCategory" AS ENUM ('ADVISOR', 'SENIOR_CONSULTANT', 'CONSULTANT', 'PROJECT_ASSOCIATE', 'YOUNG_PROFESSIONAL');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('FULL_TIME', 'PART_TIME', 'LUMP_SUM', 'REVENUE_SHARE', 'RESOURCE_PERSON');

-- CreateEnum
CREATE TYPE "ContractualDesignation" AS ENUM ('SUPPORT_EXECUTIVE', 'OFFICE_EXECUTIVE', 'ACCOUNTS_EXECUTIVE', 'TECHNICAL_EXECUTIVE', 'LEGAL_EXECUTIVE', 'PROJECT_EXECUTIVE', 'RESEARCH_EXECUTIVE', 'SENIOR_PROFESSIONAL', 'YOUNG_PROFESSIONAL_CONTRACT', 'CONSULTANT_CONTRACT', 'SENIOR_CONSULTANT_CONTRACT', 'ADVISOR_CONTRACT', 'SENIOR_ADVISOR', 'EXPERT_RETIRED');

-- CreateEnum
CREATE TYPE "EmpanelmentArea" AS ENUM ('CONSULTANCY', 'TRAINING', 'BOTH');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'AUTO_SCREENED', 'SCREENING_PENDING', 'SCREENING_APPROVED', 'SCREENING_REJECTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'COMMITTEE_EVALUATED', 'RECOMMENDED', 'NOT_RECOMMENDED', 'DG_APPROVED', 'DG_REJECTED', 'LETTER_ISSUED', 'ENGAGEMENT_ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdvertStatus" AS ENUM ('DRAFT', 'DG_APPROVED', 'PUBLISHED', 'CLOSED', 'SELECTION_DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicantBackgroundType" AS ENUM ('GOVERNMENT_GROUP_A', 'GOVERNMENT_OTHER', 'CPSE', 'AUTONOMOUS_BODY', 'PRIVATE_SECTOR', 'ACADEMIC', 'SELF_EMPLOYED', 'FRESH_GRADUATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "roles" "UserRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherOrMotherOrSpouseName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "aadhaarNumber" TEXT,
    "panNumber" TEXT,
    "correspondenceAddress" TEXT,
    "permanentAddress" TEXT,
    "contactNumbers" TEXT[],
    "photoUrl" TEXT,
    "backgroundType" "ApplicantBackgroundType" NOT NULL,
    "lastOrganization" TEXT,
    "lastDesignation" TEXT,
    "lastPayLevel" TEXT,
    "retirementDate" TIMESTAMP(3),
    "ppoNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "university" TEXT,
    "yearOfPassing" INTEGER NOT NULL,
    "grade" TEXT,
    "isPremierInstitute" BOOLEAN NOT NULL DEFAULT false,
    "isDoctorate" BOOLEAN NOT NULL DEFAULT false,
    "isPostGraduation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "payBandOrRemuneration" TEXT,
    "dutiesDescription" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isGroupAService" BOOLEAN NOT NULL DEFAULT false,
    "payLevel" TEXT,
    "isLevel12OrAbove" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubDomain" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcOffice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isHQ" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NpcOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityRule" (
    "id" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "empanelmentCategory" "EmpanelmentCategory",
    "contractualDesignation" "ContractualDesignation",
    "minExperienceYears" DOUBLE PRECISION,
    "maxExperienceYears" DOUBLE PRECISION,
    "minGroupAYears" DOUBLE PRECISION,
    "minLevel12Years" DOUBLE PRECISION,
    "requiresDoctorate" BOOLEAN NOT NULL DEFAULT false,
    "requiresPostGrad" BOOLEAN NOT NULL DEFAULT false,
    "requiresPremierInst" BOOLEAN NOT NULL DEFAULT false,
    "maxAge" INTEGER,
    "minQualification" TEXT,
    "remunerationJson" JSONB,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EligibilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "subDomainId" TEXT,
    "empanelmentArea" "EmpanelmentArea" NOT NULL,
    "autoScreenCategory" "EmpanelmentCategory",
    "autoScreenEligible" BOOLEAN,
    "autoScreenReasons" TEXT[],
    "computedTotalExpYears" DOUBLE PRECISION,
    "computedGroupAYears" DOUBLE PRECISION,
    "computedLevel12Years" DOUBLE PRECISION,
    "computedAge" INTEGER,
    "hasDoctorate" BOOLEAN NOT NULL DEFAULT false,
    "hasPostGrad" BOOLEAN NOT NULL DEFAULT false,
    "hasRelevantDegree" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpanelmentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentApplicationOfficePreference" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "preferenceOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "EmpanelmentApplicationOfficePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advert" (
    "id" TEXT NOT NULL,
    "advertNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requisitionType" TEXT NOT NULL,
    "projectName" TEXT,
    "projectValue" DOUBLE PRECISION,
    "domainId" TEXT,
    "officeId" TEXT,
    "designation" "ContractualDesignation" NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "numberOfPosts" INTEGER NOT NULL DEFAULT 1,
    "placeOfDeployment" TEXT,
    "minQualification" TEXT,
    "minExperienceYears" DOUBLE PRECISION,
    "maxAge" INTEGER,
    "specificRequirements" TEXT,
    "remunerationMin" DOUBLE PRECISION,
    "remunerationMax" DOUBLE PRECISION,
    "remunerationBasis" TEXT,
    "contractPeriodMonths" INTEGER,
    "contractStartDate" TIMESTAMP(3),
    "publishDate" TIMESTAMP(3),
    "lastDateToApply" TIMESTAMP(3),
    "applicationEmail" TEXT,
    "status" "AdvertStatus" NOT NULL DEFAULT 'DRAFT',
    "dgApprovalDate" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractualApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "advertId" TEXT NOT NULL,
    "autoScreenEligible" BOOLEAN,
    "autoScreenReasons" TEXT[],
    "computedTotalExpYears" DOUBLE PRECISION,
    "computedAge" INTEGER,
    "meetsQualification" BOOLEAN,
    "meetsExperience" BOOLEAN,
    "meetsAge" BOOLEAN,
    "suggestedRemunerationMin" DOUBLE PRECISION,
    "suggestedRemunerationMax" DOUBLE PRECISION,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractualApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "committeeType" TEXT NOT NULL,
    "domainId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMembership" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appointedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMeeting" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "agenda" TEXT,
    "minutesOfMeeting" TEXT,
    "quorumMet" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningDecision" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "decidedByUserId" TEXT NOT NULL,
    "empanelmentApplicationId" TEXT,
    "contractualApplicationId" TEXT,
    "decision" TEXT NOT NULL,
    "confirmedCategory" "EmpanelmentCategory",
    "remarks" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationScore" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "evaluatorUserId" TEXT NOT NULL,
    "empanelmentApplicationId" TEXT,
    "contractualApplicationId" TEXT,
    "technicalKnowledge" DOUBLE PRECISION,
    "communicationSkills" DOUBLE PRECISION,
    "problemSolving" DOUBLE PRECISION,
    "npcAlignment" DOUBLE PRECISION,
    "relevantExperience" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "remarks" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentRecord" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "empanelmentNumber" TEXT NOT NULL,
    "category" "EmpanelmentCategory" NOT NULL,
    "domainName" TEXT NOT NULL,
    "subDomainName" TEXT,
    "empanelmentArea" "EmpanelmentArea" NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "dgApprovalDate" TIMESTAMP(3) NOT NULL,
    "letterIssuedDate" TIMESTAMP(3),
    "letterUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "renewalDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpanelmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementOrder" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "designation" "ContractualDesignation" NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "finalRemuneration" DOUBLE PRECISION NOT NULL,
    "remunerationBasis" TEXT NOT NULL,
    "selectionCommitteeMarks" DOUBLE PRECISION,
    "contractStartDate" TIMESTAMP(3) NOT NULL,
    "contractEndDate" TIMESTAMP(3) NOT NULL,
    "placeOfDeployment" TEXT NOT NULL,
    "dutiesDescription" TEXT,
    "supervisingOfficer" TEXT,
    "dgApprovalDate" TIMESTAMP(3) NOT NULL,
    "offerLetterDate" TIMESTAMP(3),
    "offerLetterUrl" TEXT,
    "engagementOrderDate" TIMESTAMP(3),
    "engagementOrderUrl" TEXT,
    "leaveEntitlementDays" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "ApplicantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_code_key" ON "Domain"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SubDomain_domainId_name_key" ON "SubDomain"("domainId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentApplication_applicationNumber_key" ON "EmpanelmentApplication"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentApplicationOfficePreference_applicationId_office_key" ON "EmpanelmentApplicationOfficePreference"("applicationId", "officeId");

-- CreateIndex
CREATE UNIQUE INDEX "Advert_advertNumber_key" ON "Advert"("advertNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ContractualApplication_applicationNumber_key" ON "ContractualApplication"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMembership_committeeId_userId_key" ON "CommitteeMembership"("committeeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningDecision_empanelmentApplicationId_key" ON "ScreeningDecision"("empanelmentApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningDecision_contractualApplicationId_key" ON "ScreeningDecision"("contractualApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentRecord_applicationId_key" ON "EmpanelmentRecord"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentRecord_empanelmentNumber_key" ON "EmpanelmentRecord"("empanelmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementOrder_applicationId_key" ON "EngagementOrder"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementOrder_orderNumber_key" ON "EngagementOrder"("orderNumber");

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDomain" ADD CONSTRAINT "SubDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplication" ADD CONSTRAINT "EmpanelmentApplication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplication" ADD CONSTRAINT "EmpanelmentApplication_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplication" ADD CONSTRAINT "EmpanelmentApplication_subDomainId_fkey" FOREIGN KEY ("subDomainId") REFERENCES "SubDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplicationOfficePreference" ADD CONSTRAINT "EmpanelmentApplicationOfficePreference_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplicationOfficePreference" ADD CONSTRAINT "EmpanelmentApplicationOfficePreference_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "NpcOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advert" ADD CONSTRAINT "Advert_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advert" ADD CONSTRAINT "Advert_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "NpcOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractualApplication" ADD CONSTRAINT "ContractualApplication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ApplicantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractualApplication" ADD CONSTRAINT "ContractualApplication_advertId_fkey" FOREIGN KEY ("advertId") REFERENCES "Advert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMeeting" ADD CONSTRAINT "CommitteeMeeting_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningDecision" ADD CONSTRAINT "ScreeningDecision_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "CommitteeMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningDecision" ADD CONSTRAINT "ScreeningDecision_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningDecision" ADD CONSTRAINT "ScreeningDecision_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningDecision" ADD CONSTRAINT "ScreeningDecision_contractualApplicationId_fkey" FOREIGN KEY ("contractualApplicationId") REFERENCES "ContractualApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "CommitteeMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_contractualApplicationId_fkey" FOREIGN KEY ("contractualApplicationId") REFERENCES "ContractualApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentRecord" ADD CONSTRAINT "EmpanelmentRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementOrder" ADD CONSTRAINT "EngagementOrder_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ContractualApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
