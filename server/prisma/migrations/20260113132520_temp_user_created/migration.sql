-- CreateTable
CREATE TABLE "tempUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "tempUser_pkey" PRIMARY KEY ("id")
);
