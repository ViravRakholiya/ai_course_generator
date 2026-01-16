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

CRITICAL: You MUST return ONLY valid, well-formed JSON. No markdown, no code blocks, no explanations. Just pure JSON.

The response must be valid JSON matching this exact structure:
{
  "title": "Course Title",
  "description": "Brief course description (2-3 sentences)",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "order": 1,
      "duration": "2 hours"
    },
    {
      "title": "Module Title 2",
      "description": "Module description 2",
      "order": 2,
      "duration": "3 hours"
    }
  ]
}

IMPORTANT JSON RULES:
- Every array element must be separated by a comma
- Every object property must be separated by a comma
- All strings must be properly escaped (use \\" for quotes inside strings)
- No trailing commas before closing brackets or braces
- Ensure all brackets and braces are properly closed
- The "duration" field is optional - omit it if not needed, don't set it to null

Requirements:
- Create 6-8 modules for ${difficulty} level
- Each module should build upon previous ones
- Include practical, hands-on content
- Make it suitable for ${difficulty} learners
- Order modules logically from basics to advanced concepts

Create a course syllabus for: ${topic}
Difficulty level: ${difficulty}

Generate a comprehensive syllabus with modules that progressively build knowledge. Return ONLY valid JSON - no markdown code blocks, no explanations, just the JSON object.`;

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
            
            // Remove markdown code blocks
            if (jsonContent.startsWith("```json")) {
                jsonContent = jsonContent.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
            } else if (jsonContent.startsWith("```")) {
                jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            // Try to find JSON object in the content if it's not pure JSON
            const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonContent = jsonMatch[0];
            }

            // Clean up common issues with AI-generated JSON
            // Remove trailing commas before closing braces/brackets
            jsonContent = jsonContent.replace(/,(\s*[}\]])/g, "$1");
            
            // Fix missing commas between array elements or object properties
            // This regex adds commas where they're missing between values
            jsonContent = jsonContent.replace(/("\s*)(\n\s*")/g, '$1,$2'); // Missing comma between string properties
            jsonContent = jsonContent.replace(/(\}\s*)(\n\s*\{)/g, '$1,$2'); // Missing comma between objects
            jsonContent = jsonContent.replace(/(\]\s*)(\n\s*\[)/g, '$1,$2'); // Missing comma between arrays
            jsonContent = jsonContent.replace(/(\}\s*)(\n\s*")/g, '$1,$2'); // Missing comma between object and string
            jsonContent = jsonContent.replace(/(\]\s*)(\n\s*")/g, '$1,$2'); // Missing comma between array and string
            
            // Try to parse JSON with better error handling
            let parsedData: CourseData;
            try {
                parsedData = JSON.parse(jsonContent) as CourseData;
            } catch (parseError) {
                // If parsing fails, try more aggressive fixes
                console.warn("Initial JSON parse failed, attempting to fix:", parseError);
                
                // Try to find the JSON object boundaries more carefully
                const firstBrace = jsonContent.indexOf("{");
                const lastBrace = jsonContent.lastIndexOf("}");
                
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
                }
                
                // More aggressive comma fixing
                // Fix missing commas in arrays (between elements)
                jsonContent = jsonContent.replace(/([}\]"])\s*\n\s*(["{])/g, '$1,$2');
                // Fix missing commas after values before closing brackets/braces
                jsonContent = jsonContent.replace(/([^,}\]])\s*(\n\s*[}\]])/g, '$1$2');
                // Add commas between array/object elements more aggressively
                jsonContent = jsonContent.replace(/([}\]"])\s*(\n\s*)([{"\d-])/g, '$1,$3');
                
                // Remove trailing commas again after fixes
                jsonContent = jsonContent.replace(/,(\s*[}\]])/g, "$1");
                
                // Try parsing again
                try {
                    parsedData = JSON.parse(jsonContent) as CourseData;
                } catch (secondError) {
                    // Last attempt: try to manually extract and reconstruct the JSON structure
                    // This is a fallback that tries to extract the essential data
                    try {
                        // Extract title
                        const titleMatch = jsonContent.match(/"title"\s*:\s*"([^"]+)"/);
                        const descMatch = jsonContent.match(/"description"\s*:\s*"([^"]*)"/);
                        
                        // Extract modules using a more flexible regex
                        const modulesMatch = jsonContent.match(/"modules"\s*:\s*\[([\s\S]*)\]/);
                        
                        if (titleMatch && modulesMatch) {
                            // Try to parse modules individually
                            const modulesText = modulesMatch[1];
                            const moduleMatches = modulesText.matchAll(/\{[\s\S]*?"title"\s*:\s*"([^"]+)"[\s\S]*?"description"\s*:\s*"([^"]*)"[\s\S]*?"order"\s*:\s*(\d+)[\s\S]*?\}/g);
                            
                            const modules: SyllabusModuleData[] = [];
                            for (const match of moduleMatches) {
                                modules.push({
                                    title: match[1],
                                    description: match[2],
                                    order: parseInt(match[3]),
                                });
                            }
                            
                            if (modules.length > 0) {
                                parsedData = {
                                    title: titleMatch[1],
                                    description: descMatch ? descMatch[1] : "",
                                    modules: modules.sort((a, b) => a.order - b.order),
                                };
                            } else {
                                throw secondError;
                            }
                        } else {
                            throw secondError;
                        }
                    } catch (thirdError) {
                        // Log the problematic content for debugging
                        console.error("JSON parsing failed after all attempts. Content preview:", jsonContent.substring(0, 1000));
                        console.error("Parse error:", parseError);
                        throw new Error(
                            `Invalid JSON received from AI. The response contains malformed JSON that couldn't be automatically fixed. Please try generating again. Original error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
                        );
                    }
                }
            }

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
