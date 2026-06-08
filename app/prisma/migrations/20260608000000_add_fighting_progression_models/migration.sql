-- CreateEnum
CREATE TYPE "FightingItemType" AS ENUM ('WEAPON', 'ARMOR');

-- CreateTable
CREATE TABLE "fighting_characters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "base_health" INTEGER NOT NULL DEFAULT 10,
    "base_strike" INTEGER NOT NULL DEFAULT 3,
    "base_block" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fighting_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fighting_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FightingItemType" NOT NULL,
    "bonus_health" INTEGER NOT NULL DEFAULT 0,
    "bonus_strike" INTEGER NOT NULL DEFAULT 0,
    "bonus_block" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fighting_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fighting_characters_user_id_key" ON "fighting_characters"("user_id");

-- AddForeignKey
ALTER TABLE "fighting_characters" ADD CONSTRAINT "fighting_characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
