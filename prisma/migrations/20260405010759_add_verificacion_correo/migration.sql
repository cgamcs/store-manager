-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "codigoVerificacion" TEXT,
ADD COLUMN     "correoVerificado" BOOLEAN NOT NULL DEFAULT false;
