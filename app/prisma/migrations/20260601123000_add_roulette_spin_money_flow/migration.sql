-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'BET';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'WIN';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "user_id" TEXT;

-- RenameColumn
ALTER TABLE "roulette_bets" RENAME CONSTRAINT "roulette_bets_game_id_fkey" TO "roulette_bets_game_session_id_fkey";
ALTER INDEX "roulette_bets_game_id_idx" RENAME TO "roulette_bets_game_session_id_idx";
ALTER TABLE "roulette_bets" RENAME COLUMN "game_id" TO "game_session_id";

-- AlterTable
ALTER TABLE "roulette_bets"
ADD COLUMN "winning_color" TEXT,
ADD COLUMN "bet_transaction_id" TEXT,
ADD COLUMN "win_transaction_id" TEXT;

UPDATE "roulette_bets"
SET
  "winning_color" = CASE
    WHEN "winning_number" = 0 THEN 'GREEN'
    WHEN "winning_number" IN (1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36) THEN 'RED'
    ELSE 'BLACK'
  END,
  "bet_transaction_id" = 'legacy:' || "id"
WHERE "winning_color" IS NULL
   OR "bet_transaction_id" IS NULL;

ALTER TABLE "roulette_bets"
ALTER COLUMN "winning_color" SET NOT NULL,
ALTER COLUMN "bet_transaction_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "roulette_bets_bet_transaction_id_idx" ON "roulette_bets"("bet_transaction_id");
CREATE INDEX "roulette_bets_win_transaction_id_idx" ON "roulette_bets"("win_transaction_id");
