-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "invention" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);
