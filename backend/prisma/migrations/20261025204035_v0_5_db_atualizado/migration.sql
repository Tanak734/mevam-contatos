/*
  Warnings:

  - Made the column `numero` on table `connects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "connects" ALTER COLUMN "numero" SET NOT NULL;
