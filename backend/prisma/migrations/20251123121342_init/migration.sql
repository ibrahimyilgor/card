-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "accountname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login_date" TIMESTAMP(6),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_preferences" (
    "account_id" INTEGER NOT NULL,
    "language" VARCHAR(10) DEFAULT 'en',
    "theme_preference" VARCHAR(10) DEFAULT 'light',
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_preferences_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "account_daily_stats" (
    "account_id" INTEGER NOT NULL,
    "review_date" TIMESTAMP(6) NOT NULL,
    "total_decks_review_done" INTEGER DEFAULT 0,

    CONSTRAINT "account_daily_stats_pkey" PRIMARY KEY ("account_id","review_date")
);

-- CreateTable
CREATE TABLE "deck" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "mode" VARCHAR(50) DEFAULT 'standard',
    "difficulty_enabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard" (
    "id" SERIAL NOT NULL,
    "deck_id" INTEGER,
    "front_text" TEXT NOT NULL,
    "back_text" TEXT NOT NULL,
    "difficulty" INTEGER DEFAULT 3,
    "correct_count" INTEGER DEFAULT 0,
    "wrong_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_achievements" (
    "account_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "done_count" INTEGER DEFAULT 0,
    "earned_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_achievements_pkey" PRIMARY KEY ("account_id","achievement_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_accountname_key" ON "account"("accountname");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- AddForeignKey
ALTER TABLE "account_preferences" ADD CONSTRAINT "account_preferences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_daily_stats" ADD CONSTRAINT "account_daily_stats_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deck" ADD CONSTRAINT "deck_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_achievements" ADD CONSTRAINT "account_achievements_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_achievements" ADD CONSTRAINT "account_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
