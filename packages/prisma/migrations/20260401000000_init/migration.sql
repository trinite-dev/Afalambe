-- Baseline schema required before incremental migrations (email, factcheck, audit, etc.).
-- Historical migrations assumed User/Claim already existed (e.g. from db push).
-- Idempotent guards allow applying on empty or partially-provisioned databases.

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'PROCESSING', 'RESOLVED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX IF NOT EXISTS "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey'
    ) THEN
        ALTER TABLE "Session"
        ADD CONSTRAINT "Session_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Claim" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Claim_createdByUserId_updatedAt_idx" ON "Claim"("createdByUserId", "updatedAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Claim_createdByUserId_fkey'
    ) THEN
        ALTER TABLE "Claim"
        ADD CONSTRAINT "Claim_createdByUserId_fkey"
        FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ClaimMessage" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "clientReqId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClaimMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ClaimMessage_claimId_createdAt_idx" ON "ClaimMessage"("claimId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ClaimMessage_claimId_clientReqId_key" ON "ClaimMessage"("claimId", "clientReqId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ClaimMessage_claimId_fkey'
    ) THEN
        ALTER TABLE "ClaimMessage"
        ADD CONSTRAINT "ClaimMessage_claimId_fkey"
        FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
