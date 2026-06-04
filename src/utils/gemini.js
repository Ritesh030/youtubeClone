import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiError } from "./apiErrors.js";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a concise summary from a video transcript
 * @param {string} transcript - The video transcript text
 * @returns {Promise<string>} - The generated summary
 * @throws {apiError} - If API call fails
 */
const generateVideoSummary = async (transcript) => {
      try {
            // Validate transcript
            if (!transcript || transcript.trim() === "") {
                  throw new apiError(400, "Transcript cannot be empty");
            }

            // Initialize the model
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Create the prompt
            const prompt = `Generate a concise summary of this video transcript. Include:
- Main topic
- Key points (bulleted list)
- Important conclusions

Limit response to 200 words maximum.

Transcript:
${transcript}`;

            // Generate content
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summary = response.text();

            if (!summary || summary.trim() === "") {
                  throw new apiError(500, "Failed to generate summary from Gemini API");
            }

            return summary;
      } catch (error) {
            // Handle Google API specific errors
            if (error.status) {
                  throw new apiError(
                        error.status,
                        `Gemini API Error: ${error.message}`
                  );
            }

            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle other errors
            throw new apiError(
                  500,
                  `Failed to generate summary: ${error.message}`
            );
      }
};

export { generateVideoSummary };
