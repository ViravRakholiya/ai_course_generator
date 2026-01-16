'use server';

import { AIService } from '@/services/ai-service';
import { CourseService } from '@/services/course-service';
import { GenerateCourseSchema, type GenerateCourseResponse } from '@/types';

/**
 * Server Action: Generate Course Syllabus
 * 
 * This server action handles the complete flow of generating an AI-powered course syllabus:
 * 1. Validates input using Zod schema
 * 2. Gets or creates a demo user (in production, this would come from auth)
 * 3. Calls AI service to generate course content
 * 4. Saves the course and modules to the database
 * 5. Returns the created course with proper error handling
 * 
 * @param formData - Form data containing topic and difficulty
 * @returns Promise resolving to GenerateCourseResponse
 */
export async function generateCourse(
  formData: FormData
): Promise<GenerateCourseResponse> {
  try {
    // Extract and validate input
    const rawData = {
      topic: formData.get('topic') as string,
      difficulty: formData.get('difficulty') as string,
    };

    const validationResult = GenerateCourseSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Invalid input',
      };
    }

    const { topic, difficulty } = validationResult.data;

    // Get or create demo user (in production, get from session/auth)
    const demoUser = await CourseService.getOrCreateUser('demo@example.com', 'Demo User');

    // Generate course syllabus using AI
    const courseData = await AIService.generateCourseSyllabus(topic, difficulty);

    // Save to database
    const course = await CourseService.createCourseWithModules(
      demoUser.id,
      topic,
      difficulty,
      courseData
    );

    return {
      success: true,
      courseId: course.id,
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
    console.error('Error generating course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

