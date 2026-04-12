CREATE TABLE `note_tags` (
	`note_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`note_id`, `tag_id`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_tags_note_id_idx` ON `note_tags` (`note_id`);--> statement-breakpoint
CREATE INDEX `note_tags_tag_id_idx` ON `note_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`raw_input` text DEFAULT '' NOT NULL,
	`summary` text,
	`problem` text,
	`solution` text,
	`why` text,
	`commands` text,
	`references` text,
	`stack` text,
	`status` text DEFAULT 'inbox' NOT NULL,
	`confidence` text DEFAULT 'draft' NOT NULL,
	`source_type` text DEFAULT 'manual' NOT NULL,
	`source_url` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_status_idx` ON `notes` (`status`);--> statement-breakpoint
CREATE INDEX `notes_stack_idx` ON `notes` (`stack`);--> statement-breakpoint
CREATE INDEX `notes_updated_at_idx` ON `notes` (`updated_at`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_idx` ON `tags` (`name`);