import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const youtubeUrlSchema = z.string().trim().url().refine((value) => /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}/i.test(value), "يجب إدخال رابط YouTube صالح");

function getYoutubeVideoId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  return match?.[1] ?? null;
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `course-${Date.now()}`;
}

const courseFields = z.object({
  categoryId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(2).max(220),
  alternateTitle: optionalText(220),
  slug: z.string().trim().max(240).optional(),
  description: optionalText(5000),
  instructor: optionalText(160),
  imageUrl: optionalText(2000),
  coverUrl: optionalText(2000),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  catalog: router({
    categories: publicProcedure.query(() => db.getPublishedCategories()),
    courses: publicProcedure
      .input(z.object({ search: z.string().trim().max(120).optional(), categoryId: z.number().int().positive().optional(), limit: z.number().int().min(1).max(100).default(60), offset: z.number().int().min(0).default(0) }).optional())
      .query(({ input }) => db.getPublishedCourses(input)),
    courseById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => db.getPublishedCourseById(input.id)),
  }),

  admin: router({
    summary: adminProcedure.query(() => db.getAdminDashboardSummary()),
    categories: adminProcedure.query(() => db.getPublishedCategories()),
    courses: adminProcedure.input(z.object({ search: z.string().trim().max(120).optional() }).optional()).query(({ input }) => db.getAdminCourses(input?.search)),
    courseById: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => db.getAdminCourseById(input.id)),

    createCategory: adminProcedure
      .input(z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(140), description: optionalText(500), icon: optionalText(64), color: optionalText(24), isActive: z.boolean().default(true) }))
      .mutation(({ input }) => db.createCategory(input)),
    updateCategory: adminProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(2).max(120).optional(), slug: z.string().trim().min(2).max(140).optional(), description: optionalText(500), icon: optionalText(64), color: optionalText(24), isActive: z.boolean().optional() }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCategory(id, data);
      }),
    deleteCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteCategory(input.id)),

    createCourse: adminProcedure.input(courseFields).mutation(({ input }) => {
      const { slug, ...rest } = input;
      return db.createCourse({ ...rest, slug: slugify(slug || input.title), isFeatured: input.isFeatured ?? false, isPublished: input.isPublished ?? true });
    }),
    updateCourse: adminProcedure.input(courseFields.partial().extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, slug, ...rest } = input;
      return db.updateCourse(id, { ...rest, ...(slug ? { slug: slugify(slug) } : {}) });
    }),
    deleteCourse: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteCourse(input.id)),

    createLesson: adminProcedure
      .input(z.object({ courseId: z.number().int().positive(), title: z.string().trim().min(2).max(220), youtubeUrl: youtubeUrlSchema, description: optionalText(3000), durationSeconds: z.number().int().min(0).nullable().optional(), sortOrder: z.number().int().min(0).default(0), isPublished: z.boolean().default(true) }))
      .mutation(({ input }) => db.createLesson({ ...input, youtubeVideoId: getYoutubeVideoId(input.youtubeUrl) })),
    updateLesson: adminProcedure
      .input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(2).max(220).optional(), youtubeUrl: youtubeUrlSchema.optional(), description: optionalText(3000), durationSeconds: z.number().int().min(0).nullable().optional(), sortOrder: z.number().int().min(0).optional(), isPublished: z.boolean().optional() }))
      .mutation(({ input }) => {
        const { id, youtubeUrl, ...rest } = input;
        return db.updateLesson(id, { ...rest, ...(youtubeUrl ? { youtubeUrl, youtubeVideoId: getYoutubeVideoId(youtubeUrl) } : {}) });
      }),
    deleteLesson: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteLesson(input.id)),
    reorderLessons: adminProcedure.input(z.object({ courseId: z.number().int().positive(), orderedLessonIds: z.array(z.number().int().positive()).max(10000) })).mutation(({ input }) => db.reorderLessons(input.courseId, input.orderedLessonIds)),
  }),
});

export type AppRouter = typeof appRouter;
