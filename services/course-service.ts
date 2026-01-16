import { prisma } from '@/lib/prisma';
import type { CourseData } from '@/types';

/**
 * Course Service for database operations
 * 
 * Handles all database interactions related to courses and syllabus modules.
 * Follows the repository pattern for clean separation of concerns.
 */
export class CourseService {
  /**
   * Creates a new course with its syllabus modules in the database
   * 
   * Uses a transaction to ensure atomicity - if module creation fails,
   * the entire course creation is rolled back.
   * 
   * @param userId - The ID of the user creating the course
   * @param topic - The course topic
   * @param difficulty - The difficulty level
   * @param courseData - The AI-generated course data
   * @returns Promise resolving to the created course with modules
   * @throws {Error} If database operation fails
   */
  static async createCourseWithModules(
    userId: string,
    topic: string,
    difficulty: string,
    courseData: CourseData
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create the course
      const course = await tx.course.create({
        data: {
          title: courseData.title,
          topic,
          difficulty,
          description: courseData.description,
          userId,
        },
      });

      // Create all syllabus modules
      const modules = await Promise.all(
        courseData.modules.map((module) =>
          tx.syllabusModule.create({
            data: {
              courseId: course.id,
              title: module.title,
              description: module.description,
              order: module.order,
              duration: module.duration ?? null,
            },
          })
        )
      );

      return {
        ...course,
        modules,
      };
    });
  }

  /**
   * Retrieves a course by ID with all its modules
   * 
   * @param courseId - The ID of the course to retrieve
   * @returns Promise resolving to course with modules, or null if not found
   */
  static async getCourseById(courseId: string) {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Gets or creates a demo user for development/testing
   * 
   * In a production app, this would be handled by authentication.
   * This is a convenience method for the demo.
   * 
   * @param email - User email address
   * @param name - Optional user name
   * @returns Promise resolving to user object
   */
  static async getOrCreateUser(email: string, name?: string) {
    return await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: name ?? 'Demo User',
      },
    });
  }

  /**
   * Lists all courses for a user
   * 
   * @param userId - The ID of the user
   * @returns Promise resolving to array of courses with module counts
   */
  static async listCoursesByUser(userId: string) {
    return await prisma.course.findMany({
      where: { userId },
      include: {
        modules: {
          select: { id: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Updates a course and its modules
   * 
   * @param courseId - The ID of the course to update
   * @param updates - Partial course data to update
   * @returns Promise resolving to updated course
   */
  static async updateCourse(
    courseId: string,
    updates: {
      title?: string;
      description?: string;
      topic?: string;
      difficulty?: string;
    }
  ) {
    return await prisma.course.update({
      where: { id: courseId },
      data: updates,
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Updates a syllabus module
   * 
   * @param moduleId - The ID of the module to update
   * @param updates - Partial module data to update
   * @returns Promise resolving to updated module
   */
  static async updateModule(
    moduleId: string,
    updates: {
      title?: string;
      description?: string;
      order?: number;
      duration?: string | null;
    }
  ) {
    return await prisma.syllabusModule.update({
      where: { id: moduleId },
      data: updates,
    });
  }

  /**
   * Deletes a course and all its modules
   * 
   * @param courseId - The ID of the course to delete
   */
  static async deleteCourse(courseId: string) {
    return await prisma.course.delete({
      where: { id: courseId },
    });
  }
}

