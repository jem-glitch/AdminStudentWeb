import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  courses,
  InsertCategory,
  InsertCourse,
  InsertLesson,
  InsertUser,
  lessons,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values = { openId: user.openId } as typeof users.$inferInsert;
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;

    for (const field of textFields) {
      const value = user[field];
      if (value !== undefined) {
        values[field] = value ?? null;
        updateSet[field] = value ?? null;
      }
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    values.lastSignedIn ??= new Date();
    updateSet.lastSignedIn ??= new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function addLessonCounts<T extends { id: number }>(items: T[]) {
  if (!items.length) return items.map((item) => ({ ...item, lessonCount: 0 }));
  const db = await getDb();
  if (!db) return items.map((item) => ({ ...item, lessonCount: 0 }));
  const ids = items.map((item) => item.id);
  const result = await db
    .select({ courseId: lessons.courseId, lessonCount: count(lessons.id) })
    .from(lessons)
    .where(inArray(lessons.courseId, ids))
    .groupBy(lessons.courseId);
  const countMap = new Map(result.map((row) => [row.courseId, Number(row.lessonCount)]));
  return items.map((item) => ({ ...item, lessonCount: countMap.get(item.id) ?? 0 }));
}

export async function getPublishedCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
}

export async function getPublishedCourses(params?: { search?: string; categoryId?: number; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(courses.isPublished, true)];
  if (params?.categoryId) conditions.push(eq(courses.categoryId, params.categoryId));
  const search = params?.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(like(courses.title, pattern), like(courses.alternateTitle, pattern), like(courses.instructor, pattern))!);
  }
  const result = await db
    .select({ course: courses, category: categories })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(courses.isFeatured), desc(courses.updatedAt))
    .limit(params?.limit ?? 60)
    .offset(params?.offset ?? 0);
  const counted = await addLessonCounts(result.map((row) => row.course));
  const countMap = new Map(counted.map((row) => [row.id, row.lessonCount]));
  return result.map((row) => ({ ...row.course, category: row.category, lessonCount: countMap.get(row.course.id) ?? 0 }));
}

export async function getPublishedCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const courseResult = await db
    .select({ course: courses, category: categories })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(eq(courses.id, id), eq(courses.isPublished, true)))
    .limit(1);
  const row = courseResult[0];
  if (!row) return undefined;
  const courseLessons = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, id), eq(lessons.isPublished, true)))
    .orderBy(asc(lessons.sortOrder), asc(lessons.id));
  return { ...row.course, category: row.category, lessons: courseLessons };
}

export async function getAdminDashboardSummary() {
  const db = await getDb();
  if (!db) return { courses: 0, lessons: 0, categories: 0, publishedCourses: 0 };
  const [courseCount, lessonCount, categoryCount, publishedCount] = await Promise.all([
    db.select({ value: count() }).from(courses),
    db.select({ value: count() }).from(lessons),
    db.select({ value: count() }).from(categories),
    db.select({ value: count() }).from(courses).where(eq(courses.isPublished, true)),
  ]);
  return {
    courses: Number(courseCount[0]?.value ?? 0),
    lessons: Number(lessonCount[0]?.value ?? 0),
    categories: Number(categoryCount[0]?.value ?? 0),
    publishedCourses: Number(publishedCount[0]?.value ?? 0),
  };
}

export async function getAdminCourses(search?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    conditions.push(or(like(courses.title, pattern), like(courses.alternateTitle, pattern), like(courses.instructor, pattern))!);
  }
  const result = await db
    .select({ course: courses, category: categories })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(courses.updatedAt));
  const counted = await addLessonCounts(result.map((row) => row.course));
  const countMap = new Map(counted.map((row) => [row.id, row.lessonCount]));
  return result.map((row) => ({ ...row.course, category: row.category, lessonCount: countMap.get(row.course.id) ?? 0 }));
}

export async function getAdminCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const courseResult = await db
    .select({ course: courses, category: categories })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.id, id))
    .limit(1);
  const row = courseResult[0];
  if (!row) return undefined;
  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, id)).orderBy(asc(lessons.sortOrder), asc(lessons.id));
  return { ...row.course, category: row.category, lessons: courseLessons };
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return Number(result[0].insertId);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courses).values(data);
  return Number(result[0].insertId);
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lessons).where(eq(lessons.courseId, id));
  await db.delete(courses).where(eq(courses.id, id));
}

export async function createLesson(data: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessons).values(data);
  return Number(result[0].insertId);
}

export async function updateLesson(id: number, data: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function reorderLessons(courseId: number, orderedLessonIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const [index, lessonId] of orderedLessonIds.entries()) {
    await db.update(lessons).set({ sortOrder: index }).where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)));
  }
}
