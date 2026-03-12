-- CreateTable
CREATE TABLE `Challenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `goal` INTEGER NOT NULL,
    `goalUnit` VARCHAR(20) NOT NULL,
    `rewardPoints` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserChallenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `challengeId` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserChallenge_userId_challengeId_key`(`userId`, `challengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserChallenge` ADD CONSTRAINT `UserChallenge_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChallenge` ADD CONSTRAINT `UserChallenge_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `Challenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
