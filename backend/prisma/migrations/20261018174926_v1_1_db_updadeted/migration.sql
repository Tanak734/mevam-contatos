/*
  Warnings:

  - The values [recepcao,visitantes] on the enum `ministerio_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `lideres` on the `connects` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `rua` on the `local_connect` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `numero` on the `local_connect` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(10)`.
  - You are about to alter the column `bairro` on the `local_connect` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `cidade` on the `local_connect` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - You are about to drop the column `idade` on the `visitantes` table. All the data in the column will be lost.
  - Added the required column `bairro` to the `visitantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_nascimento` to the `visitantes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ministerio_tipo_new" AS ENUM ('equipe_vis_recep', 'pastoral', 'interessado');
ALTER TABLE "usuarios" ALTER COLUMN "ministerio" TYPE "ministerio_tipo_new" USING ("ministerio"::text::"ministerio_tipo_new");
ALTER TYPE "ministerio_tipo" RENAME TO "ministerio_tipo_old";
ALTER TYPE "ministerio_tipo_new" RENAME TO "ministerio_tipo";
DROP TYPE "public"."ministerio_tipo_old";
COMMIT;

-- AlterTable
ALTER TABLE "connects" ALTER COLUMN "lideres" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "local_connect" ADD COLUMN     "cep" VARCHAR(9),
ADD COLUMN     "isAtivo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "rua" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "numero" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "bairro" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "cidade" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "senha_hash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "ministerio" SET DEFAULT 'interessado';

-- AlterTable
ALTER TABLE "visitantes" DROP COLUMN "idade",
ADD COLUMN     "bairro" VARCHAR(255) NOT NULL,
ADD COLUMN     "data_nascimento" DATE NOT NULL,
ALTER COLUMN "genero" DROP NOT NULL;
