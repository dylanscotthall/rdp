-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "caption" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" INTEGER,
    CONSTRAINT "Video_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThemeVideo" (
    "themeId" INTEGER NOT NULL,
    "videoId" TEXT NOT NULL,

    PRIMARY KEY ("themeId", "videoId"),
    CONSTRAINT "ThemeVideo_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ThemeVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverImageId" TEXT,
    "coverVideoId" TEXT,
    CONSTRAINT "Theme_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Theme_coverVideoId_fkey" FOREIGN KEY ("coverVideoId") REFERENCES "Video" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Theme" ("coverImageId", "createdAt", "id", "name") SELECT "coverImageId", "createdAt", "id", "name" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_coverImageId_key" ON "Theme"("coverImageId");
CREATE UNIQUE INDEX "Theme_coverVideoId_key" ON "Theme"("coverVideoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
