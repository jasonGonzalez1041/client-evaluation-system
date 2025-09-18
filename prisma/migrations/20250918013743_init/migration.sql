-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('direcciones', 'consejo', 'comite', 'otros');

-- CreateEnum
CREATE TYPE "public"."EvaluationStatus" AS ENUM ('SUITABLE', 'POTENTIAL', 'NOT_SUITABLE');

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_id" TEXT,
    "employees" INTEGER,
    "geographic_location" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "organizational_values" TEXT,
    "has_critical_mission" BOOLEAN NOT NULL DEFAULT false,
    "has_urgency" BOOLEAN NOT NULL DEFAULT false,
    "is_manufacturer" BOOLEAN NOT NULL DEFAULT false,
    "has_distribution" BOOLEAN NOT NULL DEFAULT false,
    "has_warehouse" BOOLEAN NOT NULL DEFAULT false,
    "has_transportation" BOOLEAN NOT NULL DEFAULT false,
    "has_more_than_15_employees" BOOLEAN NOT NULL DEFAULT false,
    "has_fleet" BOOLEAN NOT NULL DEFAULT false,
    "has_website_check" BOOLEAN NOT NULL DEFAULT false,
    "has_phone_system" BOOLEAN NOT NULL DEFAULT false,
    "is_private_company" BOOLEAN NOT NULL DEFAULT false,
    "is_regional" BOOLEAN NOT NULL DEFAULT false,
    "is_legal_entity" BOOLEAN NOT NULL DEFAULT false,
    "has_tech_budget" BOOLEAN NOT NULL DEFAULT false,
    "buys_technology" BOOLEAN NOT NULL DEFAULT false,
    "has_identified_problems" BOOLEAN NOT NULL DEFAULT false,
    "has_competitive_interest" BOOLEAN NOT NULL DEFAULT false,
    "uses_social_media" BOOLEAN NOT NULL DEFAULT false,
    "has_economic_stability" BOOLEAN NOT NULL DEFAULT false,
    "is_expanding" BOOLEAN NOT NULL DEFAULT false,
    "wants_cost_reduction" BOOLEAN NOT NULL DEFAULT false,
    "has_geographic_location_acc" BOOLEAN NOT NULL DEFAULT false,
    "has_purchase_process" BOOLEAN NOT NULL DEFAULT false,
    "niche" TEXT,
    "services" TEXT,
    "opportunities" TEXT,
    "budget" TEXT,
    "authority" TEXT,
    "buyer" TEXT,
    "needs" TEXT,
    "timeline" TEXT,
    "metrics" TEXT,
    "decision_criteria" TEXT,
    "decision_process" TEXT,
    "pain_points" TEXT,
    "champion" TEXT,
    "objectives" TEXT,
    "consequences" TEXT,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "evaluation_status" "public"."EvaluationStatus" NOT NULL DEFAULT 'NOT_SUITABLE',
    "notes" TEXT,
    "evaluated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "contact_type" "public"."ContactType" NOT NULL,
    "position" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "extension" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "public"."admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE INDEX "clients_company_name_idx" ON "public"."clients"("company_name");

-- CreateIndex
CREATE INDEX "clients_evaluation_status_idx" ON "public"."clients"("evaluation_status");

-- CreateIndex
CREATE INDEX "contacts_client_id_idx" ON "public"."contacts"("client_id");

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
