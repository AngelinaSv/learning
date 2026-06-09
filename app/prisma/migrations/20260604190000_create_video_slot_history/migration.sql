-- CreateTable
CREATE TABLE "video_slot_history" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mode" INTEGER NOT NULL,
    "total_spins" INTEGER NOT NULL,
    "total_bets" DECIMAL(18,6) NOT NULL,
    "total_wins" DECIMAL(18,6) NOT NULL,
    "net_result" DECIMAL(18,6) NOT NULL,
    "rtp" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_slot_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_slot_history_game_id_key" ON "video_slot_history"("game_id");

-- CreateIndex
CREATE INDEX "video_slot_history_user_id_idx" ON "video_slot_history"("user_id");

-- CreateIndex
CREATE INDEX "video_slot_history_created_at_idx" ON "video_slot_history"("created_at");

-- AddForeignKey
ALTER TABLE "video_slot_history" ADD CONSTRAINT "video_slot_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
