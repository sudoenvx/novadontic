-- CreateTable
CREATE TABLE `cases` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_number` VARCHAR(30) NULL,
    `patient_name` VARCHAR(150) NOT NULL,
    `patient_code` VARCHAR(60) NULL,
    `request` VARCHAR(255) NULL,
    `clinic_id` BIGINT NULL,
    `clinic_name` VARCHAR(150) NULL,
    `doctor_id` BIGINT NULL,
    `doctor_name` VARCHAR(100) NULL,
    `appliance_type_id` BIGINT NULL,
    `appliance_name` VARCHAR(100) NULL,
    `workflow_template_id` BIGINT NULL,
    `workflow_name` VARCHAR(100) NULL,
    `category_id` VARCHAR(60) NULL,
    `category_name` VARCHAR(100) NULL,
    `due_date` DATE NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',
    `price_rule` VARCHAR(20) NOT NULL DEFAULT 'full',
    `billable` BOOLEAN NOT NULL DEFAULT true,
    `original_case_id` BIGINT NULL,
    `remake_reason` TEXT NULL,
    `case_field_values` JSON NOT NULL DEFAULT ('{}'),
    `arch` VARCHAR(30) NULL,
    `units` INTEGER NOT NULL DEFAULT 0,
    `created_by_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `cases_case_number_key`(`case_number`),
    INDEX `cases_created_at_id_idx`(`created_at`, `id`),
    INDEX `cases_priority_due_date_idx`(`priority`, `due_date`),
    INDEX `cases_clinic_id_idx`(`clinic_id`),
    INDEX `cases_doctor_id_idx`(`doctor_id`),
    INDEX `cases_appliance_type_id_idx`(`appliance_type_id`),
    INDEX `cases_workflow_template_id_idx`(`workflow_template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `case_stages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `source_stage_id` BIGINT NULL,
    `sort_order` SMALLINT NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `sla_hours` INTEGER NULL,
    `requires_approval` BOOLEAN NOT NULL DEFAULT false,
    `allowed_file_kinds` JSON NOT NULL DEFAULT ('["stl", "photo", "pdf", "doc"]'),
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `case_stages_case_id_sort_order_key`(`case_id`, `sort_order`),
    INDEX `case_stages_case_id_status_idx`(`case_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cases` ADD CONSTRAINT `cases_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `cases` ADD CONSTRAINT `cases_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `cases` ADD CONSTRAINT `cases_appliance_type_id_fkey` FOREIGN KEY (`appliance_type_id`) REFERENCES `appliance_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `cases` ADD CONSTRAINT `cases_workflow_template_id_fkey` FOREIGN KEY (`workflow_template_id`) REFERENCES `workflow_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `cases` ADD CONSTRAINT `cases_original_case_id_fkey` FOREIGN KEY (`original_case_id`) REFERENCES `cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `case_stages` ADD CONSTRAINT `case_stages_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
