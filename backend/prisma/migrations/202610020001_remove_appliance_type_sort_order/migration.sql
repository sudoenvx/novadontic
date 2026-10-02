DROP INDEX `appliance_types_is_active_sort_order_idx` ON `appliance_types`;

ALTER TABLE `appliance_types` DROP COLUMN `sort_order`;

CREATE INDEX `appliance_types_is_active_idx` ON `appliance_types`(`is_active`);
