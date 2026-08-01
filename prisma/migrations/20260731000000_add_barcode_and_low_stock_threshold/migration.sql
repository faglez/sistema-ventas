-- AlterTable: add barcode to Product
ALTER TABLE `Product` ADD COLUMN `barcode` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Product_barcode_key` ON `Product`(`barcode`);
