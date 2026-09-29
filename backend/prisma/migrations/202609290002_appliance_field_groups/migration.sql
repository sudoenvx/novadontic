-- AlterTable
ALTER TABLE `appliance_type_fields` ADD COLUMN `default_value` TEXT NULL,
    ADD COLUMN `depends_on` VARCHAR(60) NULL,
    ADD COLUMN `depends_on_value` VARCHAR(255) NULL,
    ADD COLUMN `group_id` BIGINT NULL,
    MODIFY `data_type` VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE `appliance_type_field_groups` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `appliance_type_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `sort_order` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `appliance_type_field_groups_appliance_type_id_sort_order_idx`(`appliance_type_id`, `sort_order`),
    UNIQUE INDEX `appliance_type_field_groups_appliance_type_id_name_key`(`appliance_type_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Preserve pre-existing ungrouped appliance fields in a default group.
INSERT INTO `appliance_type_field_groups` (`appliance_type_id`, `name`, `sort_order`)
SELECT DISTINCT `appliance_type_id`, 'General', 0
FROM `appliance_type_fields`
WHERE `group_id` IS NULL;

UPDATE `appliance_type_fields` AS `fields`
INNER JOIN `appliance_type_field_groups` AS `groups`
    ON `groups`.`appliance_type_id` = `fields`.`appliance_type_id`
    AND `groups`.`name` = 'General'
SET `fields`.`group_id` = `groups`.`id`
WHERE `fields`.`group_id` IS NULL;

-- CreateIndex
CREATE INDEX `appliance_type_fields_group_id_sort_order_idx` ON `appliance_type_fields`(`group_id`, `sort_order`);

-- CreateIndex
CREATE INDEX `appliance_types_name_idx` ON `appliance_types`(`name`);

-- CreateIndex
CREATE INDEX `appliance_types_is_active_sort_order_idx` ON `appliance_types`(`is_active`, `sort_order`);

-- AddForeignKey
ALTER TABLE `appliance_type_field_groups` ADD CONSTRAINT `appliance_type_field_groups_appliance_type_id_fkey` FOREIGN KEY (`appliance_type_id`) REFERENCES `appliance_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appliance_type_fields` ADD CONSTRAINT `appliance_type_fields_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `appliance_type_field_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
