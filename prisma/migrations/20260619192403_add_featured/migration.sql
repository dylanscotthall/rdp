-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "featuredLarge" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Image_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("caption", "createdAt", "fileUrl", "height", "id", "locationId", "width") SELECT "caption", "createdAt", "fileUrl", "height", "id", "locationId", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "caption" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "featuredLarge" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Video_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("caption", "createdAt", "duration", "fileUrl", "id", "locationId") SELECT "caption", "createdAt", "duration", "fileUrl", "id", "locationId" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
