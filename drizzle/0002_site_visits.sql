CREATE TABLE `site_visits` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`submission_id` text NOT NULL,
	`project_slug` text NOT NULL,
	`preferred_date` text NOT NULL,
	`time_slot` text NOT NULL,
	`visitors` integer DEFAULT 1 NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`message` text,
	`source_path` text,
	`consent_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`confirmed_date` text,
	`confirmed_time` text,
	`notes` text,
	`email_status` text DEFAULT 'pending' NOT NULL,
	`email_error` text,
	`email_provider_id` text,
	`ip_hash` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_visits_reference_unique` ON `site_visits` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `site_visits_submission_id_unique` ON `site_visits` (`submission_id`);--> statement-breakpoint
CREATE INDEX `site_visits_created_idx` ON `site_visits` (`created_at`);--> statement-breakpoint
CREATE INDEX `site_visits_status_idx` ON `site_visits` (`status`);--> statement-breakpoint
CREATE INDEX `site_visits_date_idx` ON `site_visits` (`preferred_date`);