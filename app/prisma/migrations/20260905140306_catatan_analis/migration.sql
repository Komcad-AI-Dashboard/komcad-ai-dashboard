-- CreateTable
CREATE TABLE "CatatanAnalis" (
    "id" TEXT NOT NULL,
    "misiId" TEXT NOT NULL,
    "penulisId" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatatanAnalis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatatanAnalis_misiId_createdAt_idx" ON "CatatanAnalis"("misiId", "createdAt");

-- AddForeignKey
ALTER TABLE "CatatanAnalis" ADD CONSTRAINT "CatatanAnalis_misiId_fkey" FOREIGN KEY ("misiId") REFERENCES "Misi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatatanAnalis" ADD CONSTRAINT "CatatanAnalis_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
