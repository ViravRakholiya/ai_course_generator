import { gemini, AVAILABLE_MODELS, listAvailableModels } from "@/lib/ai-client";
import type { CourseData, SyllabusModuleData } from "@/types";

/**
 * AI Service for generating course syllabi
 *
 * This service handles all interactions with Google's Gemini API
 * to generate structured course data based on user input.
 */
export class AIService {
    /**
     * Generates a complete course syllabus using Google Gemini
     *
     * Uses a structured prompt to ensure consistent JSON output
     * that matches the CourseData interface.
     *
     * @param topic - The subject/topic for the course
     * @param difficulty - The skill level (beginner, intermediate, advanced)
     * @returns Promise resolving to CourseData object
     * @throws {Error} If Gemini API call fails or returns invalid data
     */
    static async generateCourseSyllabus(
        topic: string,
        difficulty: string
    ): Promise<CourseData> {
        const prompt = `You are an expert educational content creator. Generate a comprehensive course syllabus in JSON format.

The response must be valid JSON matching this exact structure:
{
  "title": "Course Title",
  "description": "Brief course description (2-3 sentences)",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "order": 1,
      "duration": "2 hours" (optional)
    }
  ]
}

Requirements:
- Create 6-8 modules for ${difficulty} level
- Each module should build upon previous ones
- Include practical, hands-on content
- Make it suitable for ${difficulty} learners
- Order modules logically from basics to advanced concepts

Create a course syllabus for: ${topic}
Difficulty level: ${difficulty}

Generate a comprehensive syllabus with modules that progressively build knowledge. Return ONLY valid JSON, no additional text.`;

        try {
            // Get available models dynamically, fallback to static list
            let modelsToTry: readonly string[];
            try {
                const availableModels = await listAvailableModels();
                modelsToTry = availableModels.length > 0 ? availableModels : AVAILABLE_MODELS;
            } catch {
                modelsToTry = AVAILABLE_MODELS;
            }

            // Try available models in order until one works
            let content: string | null = null;
            let lastError: Error | null = null;

            for (const modelName of modelsToTry) {
                try {
                    // Try with structured JSON output first (for newer models)
                    let model = gemini.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2000,
                            responseMimeType: "application/json",
                        },
                    });

                    try {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        content = response.text();
                        
                        // If we got content, break out of the loop
                        if (content) {
                            break;
                        }
                    } catch (jsonError) {
                        // If JSON response format fails, try without it (for older models)
                        model = gemini.getGenerativeModel({
                            model: modelName,
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 2000,
                            },
                        });

                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        content = response.text();
                        
                        if (content) {
                            break;
                        }
                    }
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    // Continue to next model
                    continue;
                }
            }

            if (!content) {
                throw new Error(
                    `No content received from Gemini. Tried models: ${modelsToTry.join(", ")}. Last error: ${lastError?.message ?? "Unknown error"}. Please check your GEMINI_API_KEY and ensure it has access to Gemini models.`
                );
            }

            // Extract JSON from response if it's wrapped in markdown code blocks
            let jsonContent = content.trim();
            if (jsonContent.startsWith("```json")) {
                jsonContent = jsonContent.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
            } else if (jsonContent.startsWith("```")) {
                jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            const parsedData = JSON.parse(jsonContent) as CourseData;

            // Validate the structure
            if (
                !parsedData.title ||
                !parsedData.description ||
                !Array.isArray(parsedData.modules)
            ) {
                throw new Error(
                    "Invalid course data structure received from AI"
                );
            }

            // Ensure modules have proper order
            const validatedModules: SyllabusModuleData[] =
                parsedData.modules.map((module, index) => ({
                    ...module,
                    order: module.order ?? index + 1,
                }));

            return {
                ...parsedData,
                modules: validatedModules,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to generate course syllabus: ${error.message}`
                );
            }
            throw new Error(
                "Unknown error occurred while generating course syllabus"
            );
        }
    }
}
