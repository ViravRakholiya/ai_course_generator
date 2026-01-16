import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Google Gemini AI client instance
 *
 * Initializes and exports a singleton Gemini client for use across the application.
 * Requires GEMINI_API_KEY to be set in environment variables.
 *
 * @throws {Error} If GEMINI_API_KEY is not configured
 */
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

/**
 * List of model names to try in order of preference
 * Updated with stable model names that should work with the Gemini API
 * These are fallback models if dynamic model listing fails
 */
export const AVAILABLE_MODELS = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-2.0-flash-exp",
] as const;

/**
 * Lists all available models from the Gemini API using REST API
 * Useful for debugging to see which models are actually available
 *
 * @returns Promise resolving to array of model names that support generateContent
 */
export async function listAvailableModels(): Promise<string[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return AVAILABLE_MODELS.slice();
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            console.warn("Failed to fetch models list, using fallback models");
            return AVAILABLE_MODELS.slice();
        }

        const data = await response.json();
        const models = data.models || [];

        // Filter models that support generateContent
        const supportedModels = models
            .filter((model: { supportedGenerationMethods?: string[] }) =>
                model.supportedGenerationMethods?.includes("generateContent")
            )
            .map((model: { name: string }) => {
                // Extract model name from full path (e.g., "models/gemini-pro" -> "gemini-pro")
                return model.name.replace("models/", "");
            });

        return supportedModels.length > 0
            ? supportedModels
            : AVAILABLE_MODELS.slice();
    } catch (error) {
        console.error("Error listing models:", error);
        return AVAILABLE_MODELS.slice();
    }
}
