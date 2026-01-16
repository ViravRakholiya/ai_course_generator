'use server';

import { CourseService } from '@/services/course-service';
import { z } from 'zod';

/**
 * Server Action: Get all courses for the demo user
 */
export async function getAllCourses() {
    try {
        const demoUser = await CourseService.getOrCreateUser('demo@example.com', 'Demo User');
        const courses = await CourseService.listCoursesByUser(demoUser.id);

        return {
            success: true,
            courses: courses.map((course) => ({
                id: course.id,
                title: course.title,
                topic: course.topic,
                difficulty: course.difficulty,
                description: course.description,
                moduleCount: course.modules.length,
                createdAt: course.createdAt.toISOString(),
            })),
        };
    } catch (error) {
        console.error('Error fetching courses:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch courses',
            courses: [],
        };
    }
}

/**
 * Server Action: Get a single course by ID
 */
export async function getCourseById(courseId: string) {
    try {
        const course = await CourseService.getCourseById(courseId);

        if (!course) {
            return {
                success: false,
                error: 'Course not found',
            };
        }

        return {
            success: true,
            course: {
                id: course.id,
                title: course.title,
                topic: course.topic,
                difficulty: course.difficulty,
                description: course.description,
                modules: course.modules.map((module) => ({
                    id: module.id,
                    title: module.title,
                    description: module.description,
                    order: module.order,
                    duration: module.duration,
                })),
            },
        };
    } catch (error) {
        console.error('Error fetching course:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch course',
        };
    }
}

/**
 * Server Action: Update course
 */
const UpdateCourseSchema = z.object({
    courseId: z.string(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    topic: z.string().min(1).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export async function updateCourse(formData: FormData) {
    try {
        const rawData = {
            courseId: formData.get('courseId') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            topic: formData.get('topic') as string,
            difficulty: formData.get('difficulty') as string,
        };

        const validationResult = UpdateCourseSchema.safeParse(rawData);

        if (!validationResult.success) {
            return {
                success: false,
                error: validationResult.error.errors[0]?.message ?? 'Invalid input',
            };
        }

        const { courseId, ...updates } = validationResult.data;
        const updatedCourse = await CourseService.updateCourse(courseId, updates);

        return {
            success: true,
            course: {
                id: updatedCourse.id,
                title: updatedCourse.title,
                topic: updatedCourse.topic,
                difficulty: updatedCourse.difficulty,
                description: updatedCourse.description,
                modules: updatedCourse.modules.map((module) => ({
                    id: module.id,
                    title: module.title,
                    description: module.description,
                    order: module.order,
                    duration: module.duration,
                })),
            },
        };
    } catch (error) {
        console.error('Error updating course:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update course',
        };
    }
}

/**
 * Server Action: Update module
 */
const UpdateModuleSchema = z.object({
    moduleId: z.string(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().int().positive().optional(),
    duration: z.string().nullable().optional(),
});

export async function updateModule(formData: FormData) {
    try {
        const rawData = {
            moduleId: formData.get('moduleId') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            order: formData.get('order') ? parseInt(formData.get('order') as string) : undefined,
            duration: formData.get('duration') as string || null,
        };

        const validationResult = UpdateModuleSchema.safeParse(rawData);

        if (!validationResult.success) {
            return {
                success: false,
                error: validationResult.error.errors[0]?.message ?? 'Invalid input',
            };
        }

        const { moduleId, ...updates } = validationResult.data;
        const updatedModule = await CourseService.updateModule(moduleId, updates);

        return {
            success: true,
            module: {
                id: updatedModule.id,
                title: updatedModule.title,
                description: updatedModule.description,
                order: updatedModule.order,
                duration: updatedModule.duration,
            },
        };
    } catch (error) {
        console.error('Error updating module:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update module',
        };
    }
}

/**
 * Server Action: Delete course
 */
export async function deleteCourse(courseId: string) {
    try {
        await CourseService.deleteCourse(courseId);
        return {
            success: true,
        };
    } catch (error) {
        console.error('Error deleting course:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete course',
        };
    }
}

