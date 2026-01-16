import { z } from "zod";

/**
 * Difficulty levels for course generation
 */
export const DIFFICULTY_LEVELS = [
    "beginner",
    "intermediate",
    "advanced",
] as const;

/**
 * Zod schema for course generation input validation
 */
export const GenerateCourseSchema = z.object({
    topic: z
        .string()
        .min(1, "Topic is required")
        .max(200, "Topic must be less than 200 characters"),
    difficulty: z.enum(DIFFICULTY_LEVELS, {
        errorMap: () => ({
            message: "Difficulty must be beginner, intermediate, or advanced",
        }),
    }),
});

/**
 * TypeScript type inferred from GenerateCourseSchema
 */
export type GenerateCourseInput = z.infer<typeof GenerateCourseSchema>;

/**
 * Structure of a syllabus module as returned by AI
 */
export interface SyllabusModuleData {
    title: string;
    description: string;
    order: number;
    duration?: string;
}

/**
 * Structure of the complete course data as returned by AI
 */
export interface CourseData {
    title: string;
    description: string;
    modules: SyllabusModuleData[];
}

/**
 * Response structure for course generation
 */
export interface GenerateCourseResponse {
    success: boolean;
    courseId?: string;
    error?: string;
    course?: {
        id: string;
        title: string;
        topic: string;
        difficulty: string;
        description: string | null;
        modules: Array<{
            id: string;
            title: string;
            description: string;
            order: number;
            duration: string | null;
        }>;
    };
}
