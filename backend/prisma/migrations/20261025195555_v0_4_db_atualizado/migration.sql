/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `connects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "connects" ADD COLUMN     "deleted_at" TIMESTAMPTZ;

-- CreateIndex
CREATE UNIQUE INDEX "connects_nome_key" ON "connects"("nome");
