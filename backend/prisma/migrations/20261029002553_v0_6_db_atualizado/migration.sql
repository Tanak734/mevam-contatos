/*
  Warnings:

  - The values [lider,minis_acolhimento,super_user] on the enum `tipo_usuario_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `observacao` on the `visitantes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "estado_civil_tipo" AS ENUM ('solteiro', 'casado', 'divorciado', 'viuvo', 'outro');

-- AlterEnum
BEGIN;
CREATE TYPE "tipo_usuario_tipo_new" AS ENUM ('usuario_externo', 'voluntario_acolhimento', 'lider_connect', 'supervisor', 'presbitero', 'pastor', 'admin');
ALTER TABLE "public"."usuarios" ALTER COLUMN "tipo_usuario" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "tipo_usuario" TYPE "tipo_usuario_tipo_new" USING ("tipo_usuario"::text::"tipo_usuario_tipo_new");
ALTER TYPE "tipo_usuario_tipo" RENAME TO "tipo_usuario_tipo_old";
ALTER TYPE "tipo_usuario_tipo_new" RENAME TO "tipo_usuario_tipo";
DROP TYPE "public"."tipo_usuario_tipo_old";
ALTER TABLE "usuarios" ALTER COLUMN "tipo_usuario" SET DEFAULT 'usuario_externo';
COMMIT;

-- DropForeignKey
ALTER TABLE "visitantes" DROP CONSTRAINT "visitantes_connect_id_fkey";

-- DropForeignKey
ALTER TABLE "visitantes" DROP CONSTRAINT "visitantes_user_id_fkey";

-- AlterTable
ALTER TABLE "connects" ADD COLUMN     "link_maps" VARCHAR(500),
ADD COLUMN     "supervisor_id" UUID;

-- AlterTable
ALTER TABLE "visitantes" DROP COLUMN "observacao",
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "discipulador_id" UUID,
ADD COLUMN     "estado_civil" "estado_civil_tipo" NOT NULL DEFAULT 'solteiro',
ADD COLUMN     "is_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "observacao_pessoa" TEXT;

-- CreateTable
CREATE TABLE "connect_lideres" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connect_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connect_lideres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_contatos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "visitante_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "data_contato" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao_contato" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acompanhamentos_ativos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "visitante_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_ativo" BOOLEAN NOT NULL DEFAULT true,
    "iniciado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerrado_em" TIMESTAMPTZ,

    CONSTRAINT "acompanhamentos_ativos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_connect_lider_unico" ON "connect_lideres"("connect_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_historico_visitante_id" ON "historico_contatos"("visitante_id");

-- CreateIndex
CREATE INDEX "idx_historico_data_contato" ON "historico_contatos"("data_contato");

-- CreateIndex
CREATE INDEX "idx_acomp_visitante" ON "acompanhamentos_ativos"("visitante_id");

-- CreateIndex
CREATE INDEX "idx_acomp_user" ON "acompanhamentos_ativos"("user_id");

-- CreateIndex
CREATE INDEX "idx_acomp_ativo" ON "acompanhamentos_ativos"("is_ativo");

-- CreateIndex
CREATE UNIQUE INDEX "idx_acomp_visitante_user_unico" ON "acompanhamentos_ativos"("visitante_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_visitantes_nome" ON "visitantes"("nome");

-- CreateIndex
CREATE INDEX "idx_visitantes_created_at" ON "visitantes"("created_at");

-- CreateIndex
CREATE INDEX "idx_visitantes_discipulador_id" ON "visitantes"("discipulador_id");

-- CreateIndex
CREATE INDEX "idx_visitantes_is_ativo" ON "visitantes"("is_ativo");

-- AddForeignKey
ALTER TABLE "connects" ADD CONSTRAINT "connects_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connect_lideres" ADD CONSTRAINT "connect_lideres_connect_id_fkey" FOREIGN KEY ("connect_id") REFERENCES "connects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connect_lideres" ADD CONSTRAINT "connect_lideres_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitantes" ADD CONSTRAINT "visitantes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitantes" ADD CONSTRAINT "visitantes_discipulador_id_fkey" FOREIGN KEY ("discipulador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitantes" ADD CONSTRAINT "visitantes_connect_id_fkey" FOREIGN KEY ("connect_id") REFERENCES "connects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_contatos" ADD CONSTRAINT "historico_contatos_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_contatos" ADD CONSTRAINT "historico_contatos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acompanhamentos_ativos" ADD CONSTRAINT "acompanhamentos_ativos_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acompanhamentos_ativos" ADD CONSTRAINT "acompanhamentos_ativos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
