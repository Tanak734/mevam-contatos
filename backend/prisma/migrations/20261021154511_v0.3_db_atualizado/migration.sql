/*
  Warnings:

  - The values [amigo_colega] on the enum `como_conheceu_tipo` will be removed. If these variants are still used in the database, this will fail.
  - The values [membro,visitante] on the enum `status_pessoa_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `ministerio` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `ultima_visita` on the `visitantes` table. All the data in the column will be lost.
  - You are about to drop the `local_connect` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[telefone]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefone]` on the table `visitantes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bairro` to the `connects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rua` to the `connects` table without a default value. This is not possible if the table is not empty.
  - Made the column `cidade_mora` on table `visitantes` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "status_membro_tipo" AS ENUM ('nao_membro', 'membro');

-- CreateEnum
CREATE TYPE "tipo_usuario_tipo" AS ENUM ('usuario_externo', 'lider', 'minis_acolhimento', 'super_user');

-- CreateEnum
CREATE TYPE "residencia_tipo" AS ENUM ('casa', 'apartamento', 'condominio');

-- AlterEnum
BEGIN;
CREATE TYPE "como_conheceu_tipo_new" AS ENUM ('amigo', 'familia', 'convite_pessoa', 'redes_sociais', 'youtube', 'oracao_12h', 'google_maps', 'passando_proximo', 'connect', 'acao_social', 'evento', 'outro');
ALTER TABLE "visitantes" ALTER COLUMN "como_conheceu" TYPE "como_conheceu_tipo_new" USING ("como_conheceu"::text::"como_conheceu_tipo_new");
ALTER TYPE "como_conheceu_tipo" RENAME TO "como_conheceu_tipo_old";
ALTER TYPE "como_conheceu_tipo_new" RENAME TO "como_conheceu_tipo";
DROP TYPE "public"."como_conheceu_tipo_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "status_pessoa_tipo_new" AS ENUM ('novo_convertido', 'afastado', 'em_transicao', 'outra_igreja', 'lideranca_outra_igreja', 'uber');
ALTER TABLE "public"."visitantes" ALTER COLUMN "status_pessoa" DROP DEFAULT;
ALTER TABLE "visitantes" ALTER COLUMN "status_pessoa" TYPE "status_pessoa_tipo_new" USING ("status_pessoa"::text::"status_pessoa_tipo_new");
ALTER TYPE "status_pessoa_tipo" RENAME TO "status_pessoa_tipo_old";
ALTER TYPE "status_pessoa_tipo_new" RENAME TO "status_pessoa_tipo";
DROP TYPE "public"."status_pessoa_tipo_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "local_connect" DROP CONSTRAINT "local_connect_connect_id_fkey";

-- DropIndex
DROP INDEX "usuarios_email_key";

-- AlterTable
ALTER TABLE "connects" ADD COLUMN     "bairro" VARCHAR(100) NOT NULL,
ADD COLUMN     "cep" VARCHAR(9),
ADD COLUMN     "cidade" VARCHAR(100) NOT NULL DEFAULT 'Campinas',
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "is_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "numero" VARCHAR(10),
ADD COLUMN     "rua" VARCHAR(100) NOT NULL,
ADD COLUMN     "tipo_residencia" "residencia_tipo" NOT NULL DEFAULT 'casa';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "email",
DROP COLUMN "isAdmin",
DROP COLUMN "ministerio",
ADD COLUMN     "genero" "genero_tipo",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipo_usuario" "tipo_usuario_tipo" NOT NULL DEFAULT 'usuario_externo';

-- AlterTable
ALTER TABLE "visitantes" DROP COLUMN "ultima_visita",
ADD COLUMN     "apelido_referencia" VARCHAR(120),
ADD COLUMN     "outro_meio" VARCHAR(150),
ADD COLUMN     "status_membro" "status_membro_tipo" NOT NULL DEFAULT 'nao_membro',
ADD COLUMN     "tempo_membresia" DATE,
ALTER COLUMN "cidade_mora" SET NOT NULL,
ALTER COLUMN "cidade_mora" SET DEFAULT 'Campinas',
ALTER COLUMN "status_pessoa" DROP NOT NULL,
ALTER COLUMN "status_pessoa" DROP DEFAULT,
ALTER COLUMN "ultimo_contato" SET DATA TYPE DATE,
ALTER COLUMN "bairro" DROP NOT NULL,
ALTER COLUMN "data_nascimento" DROP NOT NULL;

-- DropTable
DROP TABLE "local_connect";

-- DropEnum
DROP TYPE "ministerio_tipo";

-- DropEnum
DROP TYPE "tipo_residencia_tipo";

-- CreateIndex
CREATE INDEX "idx_connects_bairro" ON "connects"("bairro");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "visitantes_telefone_key" ON "visitantes"("telefone");

-- CreateIndex
CREATE INDEX "idx_visitantes_status_membro" ON "visitantes"("status_membro");

-- CreateIndex
CREATE INDEX "idx_visitantes_bairro" ON "visitantes"("bairro");
