import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable(
  "course_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 64 }),
    color: varchar("color", { length: 24 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("course_categories_slug_unique").on(table.slug),
    activeIndex: index("course_categories_active_idx").on(table.isActive),
  }),
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId"),
    title: varchar("title", { length: 220 }).notNull(),
    alternateTitle: varchar("alternateTitle", { length: 220 }),
    slug: varchar("slug", { length: 240 }).notNull(),
    description: text("description"),
    instructor: varchar("instructor", { length: 160 }),
    imageUrl: text("imageUrl"),
    coverUrl: text("coverUrl"),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("courses_slug_unique").on(table.slug),
    catalogIndex: index("courses_catalog_idx").on(table.isPublished, table.isFeatured),
    categoryIndex: index("courses_category_idx").on(table.categoryId, table.isPublished),
  }),
);

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export const lessons = mysqlTable(
  "lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("courseId").notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    youtubeUrl: text("youtubeUrl").notNull(),
    youtubeVideoId: varchar("youtubeVideoId", { length: 32 }),
    description: text("description"),
    durationSeconds: int("durationSeconds"),
    sortOrder: int("sortOrder").default(0).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    courseOrderIndex: index("lessons_course_order_idx").on(table.courseId, table.sortOrder),
    visibilityIndex: index("lessons_visibility_idx").on(table.courseId, table.isPublished),
  }),
);

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
