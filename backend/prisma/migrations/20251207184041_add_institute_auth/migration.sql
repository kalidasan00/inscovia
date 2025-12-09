-- CreateTable
CREATE TABLE "InstituteUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstituteUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstituteUser_email_key" ON "InstituteUser"("email");

-- CreateIndex
CREATE INDEX "InstituteUser_email_idx" ON "InstituteUser"("email");

-- AddForeignKey
ALTER TABLE "Center" ADD CONSTRAINT "Center_userId_fkey" FOREIGN KEY ("userId") REFERENCES "InstituteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
