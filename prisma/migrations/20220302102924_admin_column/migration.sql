-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- Update `Bastion Bot`
UPDATE "User" SET "admin" = true WHERE "id" = 1;
