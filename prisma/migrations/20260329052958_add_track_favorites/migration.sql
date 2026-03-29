-- CreateTable
CREATE TABLE "TrackFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackFavorite_userId_idx" ON "TrackFavorite"("userId");

-- CreateIndex
CREATE INDEX "TrackFavorite_trackId_idx" ON "TrackFavorite"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackFavorite_userId_trackId_key" ON "TrackFavorite"("userId", "trackId");

-- AddForeignKey
ALTER TABLE "TrackFavorite" ADD CONSTRAINT "TrackFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackFavorite" ADD CONSTRAINT "TrackFavorite_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
