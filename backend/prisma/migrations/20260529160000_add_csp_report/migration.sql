-- CreateTable
CREATE TABLE "CspReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "directive" TEXT NOT NULL,
    "blockedUri" TEXT NOT NULL,
    "documentUri" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
