
-- CreateEnum
CREATE TYPE "RouletteBetType" AS ENUM ('NUMBER', 'COLOR', 'EVEN_ODD', 'DOZEN', 'COLUMN', 'RANGE');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "roulette_bets" DROP COLUMN "bet_amount",
DROP COLUMN "payout_amount",
ADD COLUMN     "betAmount" DECIMAL(18,6) NOT NULL,
ADD COLUMN     "bet_value" TEXT NOT NULL,
ADD COLUMN     "payoutAmount" DECIMAL(18,6) NOT NULL,
ADD COLUMN     "profit" DECIMAL(18,6) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "bet_type",
ADD COLUMN     "bet_type" "RouletteBetType" NOT NULL;

-- CreateIndex
CREATE INDEX "roulette_bets_user_id_idx" ON "roulette_bets"("user_id");

-- CreateIndex
CREATE INDEX "roulette_bets_created_at_idx" ON "roulette_bets"("created_at");

-- AddForeignKey
ALTER TABLE "roulette_bets" ADD CONSTRAINT "roulette_bets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
