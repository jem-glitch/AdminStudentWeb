CREATE TABLE `course_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`color` varchar(24),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`title` varchar(220) NOT NULL,
	`alternateTitle` varchar(220),
	`slug` varchar(240) NOT NULL,
	`description` text,
	`instructor` varchar(160),
	`imageUrl` text,
	`coverUrl` text,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(220) NOT NULL,
	`youtubeUrl` text NOT NULL,
	`youtubeVideoId` varchar(32),
	`description` text,
	`durationSeconds` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `course_categories_active_idx` ON `course_categories` (`isActive`);--> statement-breakpoint
CREATE INDEX `courses_catalog_idx` ON `courses` (`isPublished`,`isFeatured`);--> statement-breakpoint
CREATE INDEX `courses_category_idx` ON `courses` (`categoryId`,`isPublished`);--> statement-breakpoint
CREATE INDEX `lessons_course_order_idx` ON `lessons` (`courseId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `lessons_visibility_idx` ON `lessons` (`courseId`,`isPublished`);