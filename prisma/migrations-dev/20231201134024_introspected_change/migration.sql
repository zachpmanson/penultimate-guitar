-- CreateTable
CREATE TABLE "Tab" (
    "id" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,
    "tab" TEXT NOT NULL,
    "taburl" TEXT NOT NULL,
    "contributors" TEXT[],
    "capo" INTEGER NOT NULL,
    "tuning" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TEXT DEFAULT '2023-05-27T16:51:42.319Z',

    CONSTRAINT "Tab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tab_taburl_key" ON "Tab"("taburl");

-- AddForeignKey
ALTER TABLE "Tab" ADD CONSTRAINT "Tab_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
