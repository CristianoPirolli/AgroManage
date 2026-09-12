-- CreateEnum
CREATE TYPE "crop_status" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'HARVESTED');

-- CreateEnum
CREATE TYPE "expense_category" AS ENUM ('INSUMOS', 'COMBUSTIVEL', 'MANUTENCAO', 'MAO_DE_OBRA', 'MAQUINARIO', 'OUTROS');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "total_area" DOUBLE PRECISION NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "planted_area" DOUBLE PRECISION NOT NULL,
    "planting_date" TIMESTAMP(3) NOT NULL,
    "expected_harvest_date" TIMESTAMP(3),
    "status" "crop_status" NOT NULL DEFAULT 'PLANNED',
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "category" TEXT NOT NULL,
    "property_id" INTEGER NOT NULL,
    "crop_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "minimum_quantity" DOUBLE PRECISION NOT NULL,
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "expense_category" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production" (
    "id" SERIAL NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "harvest_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "crop_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "property_user_id_idx" ON "property"("user_id");

-- CreateIndex
CREATE INDEX "crop_property_id_idx" ON "crop"("property_id");

-- CreateIndex
CREATE INDEX "activity_property_id_idx" ON "activity"("property_id");

-- CreateIndex
CREATE INDEX "activity_crop_id_idx" ON "activity"("crop_id");

-- CreateIndex
CREATE INDEX "stock_item_property_id_idx" ON "stock_item"("property_id");

-- CreateIndex
CREATE INDEX "expense_property_id_idx" ON "expense"("property_id");

-- CreateIndex
CREATE INDEX "production_crop_id_idx" ON "production"("crop_id");

-- CreateIndex
CREATE INDEX "production_property_id_idx" ON "production"("property_id");

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop" ADD CONSTRAINT "crop_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_item" ADD CONSTRAINT "stock_item_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production" ADD CONSTRAINT "production_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production" ADD CONSTRAINT "production_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
