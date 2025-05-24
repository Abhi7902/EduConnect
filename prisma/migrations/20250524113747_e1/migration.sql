/*
  Warnings:

  - Added the required column `totalPoints` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "totalPoints" INTEGER NOT NULL;
