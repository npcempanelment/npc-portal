-- AlterTable
ALTER TABLE "Advert" ADD COLUMN     "desirableSkills" TEXT,
ADD COLUMN     "eligibilityCriteria" TEXT,
ADD COLUMN     "functionalRole" TEXT,
ADD COLUMN     "generalConditions" TEXT,
ADD COLUMN     "qualificationDetails" TEXT,
ADD COLUMN     "remunerationNote" TEXT,
ADD COLUMN     "termsAndConditions" TEXT,
ADD COLUMN     "travelNote" TEXT,
ADD COLUMN     "travelRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workResponsibilities" TEXT,
ADD COLUMN     "workingHoursNote" TEXT;
