import axios from "axios";
import { apiError } from "./apiErrors.js";

const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_ATTEMPTS = 120; // 6 minutes maximum wait

const submitTranscription = async (videoUrl) => {
      try {
            if (!videoUrl || videoUrl.trim() === "") {
                  throw new apiError(400, "Video URL cannot be empty");
            }

            const response = await axios.post(
                  `${ASSEMBLYAI_BASE_URL}/transcript`,
                  {
                        audio_url: videoUrl,
                        language_code: "en", // Set to English
                  },
                  {
                        headers: {
                              Authorization: process.env.ASSEMBLYAI_API_KEY,
                              "Content-Type": "application/json",
                        },
                  }
            );

            if (!response.data?.id) {
                  throw new apiError(500, "Failed to get transcript ID from AssemblyAI");
            }

            return response.data.id;
      } catch (error) {
            // Handle axios errors
            if (error.response?.status) {
                  throw new apiError(
                        error.response.status,
                        `AssemblyAI Error: ${error.response.data?.error || error.message}`
                  );
            }

            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle other errors
            throw new apiError(
                  500,
                  `Failed to submit transcription: ${error.message}`
            );
      }
};

/**
 * Poll AssemblyAI for transcription result
 * @param {string} transcriptId - The transcript ID to poll
 * @returns {Promise<Object>} - The transcript result with status and text
 * @throws {apiError} - If polling fails or times out
 */
const pollTranscriptionResult = async (transcriptId) => {
      try {
            if (!transcriptId || transcriptId.trim() === "") {
                  throw new apiError(400, "Transcript ID cannot be empty");
            }

            let pollAttempts = 0;

            while (pollAttempts < MAX_POLL_ATTEMPTS) {
                  const response = await axios.get(
                        `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
                        {
                              headers: {
                                    Authorization: process.env.ASSEMBLYAI_API_KEY,
                              },
                        }
                  );

                  const { status, text, error } = response.data;

                  // Check if transcription failed
                  if (status === "error") {
                        throw new apiError(
                              500,
                              `AssemblyAI Transcription Error: ${error || "Unknown error"}`
                        );
                  }

                  // Check if transcription is complete
                  if (status === "completed") {
                        if (!text || text.trim() === "") {
                              throw new apiError(400, "No transcript text received from AssemblyAI");
                        }
                        return {
                              status: "completed",
                              text: text,
                        };
                  }

                  // Status is "processing" - wait and retry
                  pollAttempts++;
                  await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
            }

            // Timeout reached
            throw new apiError(
                  408,
                  "Transcription polling timeout - request took too long"
            );
      } catch (error) {
            // Handle axios errors
            if (error.response?.status) {
                  throw new apiError(
                        error.response.status,
                        `AssemblyAI Error: ${error.response.data?.error || error.message}`
                  );
            }

            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle other errors
            throw new apiError(
                  500,
                  `Failed to poll transcription result: ${error.message}`
            );
      }
};

/**
 * Get transcript text for a completed transcription
 * @param {string} transcriptId - The transcript ID
 * @returns {Promise<string>} - The transcript text
 * @throws {apiError} - If retrieval fails
 */
const getTranscriptText = async (transcriptId) => {
      try {
            const result = await pollTranscriptionResult(transcriptId);
            return result.text;
      } catch (error) {
            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle other errors
            throw new apiError(
                  500,
                  `Failed to get transcript text: ${error.message}`
            );
      }
};

export {
      submitTranscription,
      pollTranscriptionResult,
      getTranscriptText,
};
