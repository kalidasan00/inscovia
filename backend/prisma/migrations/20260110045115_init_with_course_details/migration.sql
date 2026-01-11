-- CreateEnum
CREATE TYPE "InstituteCategory" AS ENUM ('TECHNOLOGY', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING');

-- CreateEnum
CREATE TYPE "CenterCategory" AS ENUM ('TECHNOLOGY', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTITUTE', 'USER');

-- CreateEnum
CREATE TYPE "TeachingMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateTable
CREATE TABLE "InstituteUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "primaryCategory" "InstituteCategory" NOT NULL,
    "secondaryCategories" "InstituteCategory"[] DEFAULT ARRAY[]::"InstituteCategory"[],
    "teachingMode" "TeachingMode" NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'INSTITUTE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstituteUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Center" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryCategory" "CenterCategory" NOT NULL,
    "secondaryCategories" "CenterCategory"[] DEFAULT ARRAY[]::"CenterCategory"[],
    "teachingMode" "TeachingMode" NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "courses" TEXT[],
    "image" TEXT,
    "logo" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL,
    "website" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstituteUser_email_key" ON "InstituteUser"("email");

-- CreateIndex
CREATE INDEX "InstituteUser_email_idx" ON "InstituteUser"("email");

-- CreateIndex
CREATE INDEX "InstituteUser_primaryCategory_idx" ON "InstituteUser"("primaryCategory");

-- CreateIndex
CREATE INDEX "InstituteUser_teachingMode_idx" ON "InstituteUser"("teachingMode");

-- CreateIndex
CREATE INDEX "InstituteUser_role_idx" ON "InstituteUser"("role");

-- CreateIndex
CREATE INDEX "InstituteUser_city_idx" ON "InstituteUser"("city");

-- CreateIndex
CREATE INDEX "InstituteUser_state_idx" ON "InstituteUser"("state");

-- CreateIndex
CREATE INDEX "InstituteUser_city_state_idx" ON "InstituteUser"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Center_slug_key" ON "Center"("slug");

-- CreateIndex
CREATE INDEX "Center_slug_idx" ON "Center"("slug");

-- CreateIndex
CREATE INDEX "Center_state_district_city_idx" ON "Center"("state", "district", "city");

-- CreateIndex
CREATE INDEX "Center_userId_idx" ON "Center"("userId");

-- CreateIndex
CREATE INDEX "Center_primaryCategory_idx" ON "Center"("primaryCategory");

-- CreateIndex
CREATE INDEX "Center_teachingMode_idx" ON "Center"("teachingMode");

-- CreateIndex
CREATE INDEX "Center_city_idx" ON "Center"("city");

-- CreateIndex
CREATE INDEX "Center_state_idx" ON "Center"("state");

-- CreateIndex
CREATE INDEX "Center_rating_idx" ON "Center"("rating");

-- CreateIndex
CREATE INDEX "Review_centerId_idx" ON "Review"("centerId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userEmail_centerId_key" ON "Review"("userEmail", "centerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Center" ADD CONSTRAINT "Center_userId_fkey" FOREIGN KEY ("userId") REFERENCES "InstituteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;
