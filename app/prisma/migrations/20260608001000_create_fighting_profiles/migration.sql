-- CreateTable
CREATE TABLE "fighting_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "selected_hero" TEXT NOT NULL DEFAULT 'CYBER_NINJA',
    "rating" INTEGER NOT NULL DEFAULT 800,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fighting_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fighting_profiles_user_id_key" ON "fighting_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "fighting_profiles" ADD CONSTRAINT "fighting_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
