-- CreateTable
CREATE TABLE "TrackTab" (
    "id" SERIAL NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "taburl" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackTab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackTab_spotifyTrackId_key" ON "TrackTab"("spotifyTrackId");
