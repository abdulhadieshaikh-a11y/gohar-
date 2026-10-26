CREATE TABLE `career_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`submission_id` text NOT NULL,
	`vacancy_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text,
	`role_interest` text,
	`profile_url` text,
	`message` text,
	`cv_filename` text NOT NULL,
	`cv_mime` text NOT NULL,
	`cv_size` integer NOT NULL,
	`consent_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`email_status` text DEFAULT 'pending' NOT NULL,
	`email_error` text,
	`ip_hash` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `career_applications_reference_unique` ON `career_applications` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `career_applications_submission_id_unique` ON `career_applications` (`submission_id`);--> statement-breakpoint
CREATE INDEX `applications_created_idx` ON `career_applications` (`created_at`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `career_applications` (`status`);--> statement-breakpoint
CREATE TABLE `career_cvs` (
	`application_id` text PRIMARY KEY NOT NULL,
	`data_base64` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `career_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
