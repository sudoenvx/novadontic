CREATE TABLE `case_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `stage_id` BIGINT NULL,
    `storage_key` VARCHAR(36) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(127) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `size_bytes` BIGINT NOT NULL,
    `uploaded_by_id` BIGINT NULL,
    `uploaded_by_name` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `case_files_storage_key_key`(`storage_key`),
    INDEX `case_files_case_id_kind_created_at_idx`(`case_id`, `kind`, `created_at`),
    INDEX `case_files_stage_id_idx`(`stage_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `case_timeline_entries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `event_type` VARCHAR(60) NULL,
    `message` TEXT NOT NULL,
    `actor_id` BIGINT NULL,
    `actor_name` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `case_timeline_entries_case_id_created_at_id_idx`(`case_id`, `created_at`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `case_files`
    ADD CONSTRAINT `case_files_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `case_files_stage_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `case_stages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `case_files_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `case_timeline_entries`
    ADD CONSTRAINT `case_timeline_entries_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `case_timeline_entries_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO `case_timeline_entries` (`case_id`, `kind`, `event_type`, `message`, `actor_id`, `actor_name`, `created_at`)
SELECT `cases`.`id`, 'event', 'case_created', 'Case received', `cases`.`created_by_id`,
       COALESCE(`users`.`full_name`, 'System'), `cases`.`created_at`
FROM `cases`
LEFT JOIN `users` ON `users`.`id` = `cases`.`created_by_id`;

INSERT INTO `roles` (`code`, `name`, `description`, `is_system`)
SELECT 'technician', 'Technician', 'Work on assigned production stages and case files.', true
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `code` = 'technician');

INSERT INTO `roles` (`code`, `name`, `description`, `is_system`)
SELECT 'quality_controller', 'Quality Controller', 'Review completed work and approve cases for delivery.', true
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `code` = 'quality_controller');

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT `technician`.`id`, `role_permissions`.`permission_id`
FROM `roles` AS `developer`
JOIN `role_permissions` ON `role_permissions`.`role_id` = `developer`.`id`
JOIN `roles` AS `technician` ON `technician`.`code` = 'technician'
WHERE `developer`.`code` = 'developer';

INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`)
SELECT `user_roles`.`user_id`, `technician`.`id`
FROM `roles` AS `developer`
JOIN `user_roles` ON `user_roles`.`role_id` = `developer`.`id`
JOIN `roles` AS `technician` ON `technician`.`code` = 'technician'
WHERE `developer`.`code` = 'developer';

DELETE `role_permissions` FROM `role_permissions`
JOIN `roles` ON `roles`.`id` = `role_permissions`.`role_id`
WHERE `roles`.`code` = 'developer';

DELETE `user_roles` FROM `user_roles`
JOIN `roles` ON `roles`.`id` = `user_roles`.`role_id`
WHERE `roles`.`code` = 'developer';

DELETE FROM `roles` WHERE `code` = 'developer';

UPDATE `roles`
SET `name` = 'Technician',
    `description` = 'Work on assigned production stages and case files.',
    `is_system` = true
WHERE `code` = 'technician';

UPDATE `roles`
SET `name` = 'Quality Controller',
    `description` = 'Review completed work and approve cases for delivery.',
    `is_system` = true
WHERE `code` = 'quality_controller';
