-- CreateTable
CREATE TABLE "Repository" (
    "key" BYTEA[],
    "value" BYTEA NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
