-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTablink" (
    "id" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "taburl" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "name" TEXT,
    "artist" TEXT,
    "type" TEXT,
    "version" INTEGER,

    CONSTRAINT "UserTablink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyUserId_key" ON "User"("spotifyUserId");

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_spotifyUserId_fkey" FOREIGN KEY ("spotifyUserId") REFERENCES "User"("spotifyUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
