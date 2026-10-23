-- CreateEnum
CREATE TYPE "genero_tipo" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "status_pessoa_tipo" AS ENUM ('membro', 'visitante');

-- CreateEnum
CREATE TYPE "como_conheceu_tipo" AS ENUM ('amigo_colega', 'familia', 'redes_sociais', 'youtube', 'passando_proximo', 'connect');

-- CreateEnum
CREATE TYPE "ministerio_tipo" AS ENUM ('recepcao', 'visitantes', 'pastoral');

-- CreateEnum
CREATE TYPE "tipo_residencia_tipo" AS ENUM ('casa', 'apartamento', 'condominio');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "senha_hash" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "ministerio" "ministerio_tipo" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(100) NOT NULL,
    "lideres" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "connects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_connect" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connect_id" UUID NOT NULL,
    "tipo_residencia" "tipo_residencia_tipo" NOT NULL DEFAULT 'casa',
    "rua" VARCHAR(255) NOT NULL,
    "numero" VARCHAR(255),
    "bairro" VARCHAR(255) NOT NULL,
    "cidade" VARCHAR(255) NOT NULL,
    "complemento" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "local_connect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitantes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "connect_id" UUID,
    "nome" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "idade" INTEGER,
    "genero" "genero_tipo" NOT NULL,
    "cidade_mora" VARCHAR(100),
    "status_pessoa" "status_pessoa_tipo" NOT NULL DEFAULT 'visitante',
    "como_conheceu" "como_conheceu_tipo" NOT NULL,
    "ultimo_contato" TIMESTAMPTZ,
    "ultima_visita" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "visitantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "local_connect_connect_id_key" ON "local_connect"("connect_id");

-- CreateIndex
CREATE INDEX "idx_visitantes_user_id" ON "visitantes"("user_id");

-- CreateIndex
CREATE INDEX "idx_visitantes_connect_id" ON "visitantes"("connect_id");

-- CreateIndex
CREATE INDEX "idx_visitantes_ultimo_contato" ON "visitantes"("ultimo_contato");

-- CreateIndex
CREATE INDEX "idx_visitantes_status_pessoa" ON "visitantes"("status_pessoa");

-- AddForeignKey
ALTER TABLE "local_connect" ADD CONSTRAINT "local_connect_connect_id_fkey" FOREIGN KEY ("connect_id") REFERENCES "connects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitantes" ADD CONSTRAINT "visitantes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visitantes" ADD CONSTRAINT "visitantes_connect_id_fkey" FOREIGN KEY ("connect_id") REFERENCES "connects"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
