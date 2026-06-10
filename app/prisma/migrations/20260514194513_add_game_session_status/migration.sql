-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('ACTIVE', 'FINISHED');

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "finished_at" TIMESTAMP(3),
ADD COLUMN     "status" "GameSessionStatus" NOT NULL DEFAULT 'ACTIVE';
