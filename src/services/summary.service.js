import {
      submitTranscription,
      getTranscriptText,
} from "../utils/assemblyai.js";
import { generateVideoSummary } from "../utils/gemini.js";
import {
      findVideoById,
      updateVideoSummary,
} from "../repositories/video.repository.js";
import { apiError } from "../utils/apiErrors.js";

/**
 * Generate summary for a video
 * Step 1: Validate video exists and has URL
 * Step 2: Submit video URL to AssemblyAI for transcription
 * Step 3: Poll and wait for transcription completion
 * Step 4: Get transcript text
 * Step 5: Generate summary using Gemini AI
 * Step 6: Store summary and transcript in database
 * Step 7: Return summary
 * @param {string} videoId - The video ID
 * @returns {Promise<Object>} - Object with summary, transcript, and generatedAt
 * @throws {apiError} - If any step fails
 */
const generateAndStoreSummary = async (videoId) => {
      try {
            // Step 1: Validate video exists and has URL
            const video = await findVideoById(videoId);

            if (!video.videoFile || video.videoFile.trim() === "") {
                  throw new apiError(400, "Video file URL not found");
            }

            // Step 2: Submit video URL to AssemblyAI
            const transcriptId = await submitTranscription(video.videoFile);

            // Step 3 & 4: Poll and get transcript text
            const transcriptText = await getTranscriptText(transcriptId);

            // Step 5: Generate summary using Gemini AI
            const summary = await generateVideoSummary(transcriptText);

            // Step 6: Store summary and transcript in database
            const summaryGeneratedAt = new Date();
            const updatedVideo = await updateVideoSummary(videoId, {
                  transcript: transcriptText,
                  summary: summary,
                  summaryGeneratedAt: summaryGeneratedAt,
            });

            // Step 7: Return summary
            return {
                  videoId: updatedVideo._id,
                  summary: updatedVideo.summary,
                  transcript: updatedVideo.transcript,
                  generatedAt: updatedVideo.summaryGeneratedAt,
            };
      } catch (error) {
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

/**
 * Retrieve existing summary for a video
 * @param {string} videoId - The video ID
 * @returns {Promise<Object>} - Object with summary and generatedAt
 * @throws {apiError} - If video not found or summary doesn't exist
 */
const getExistingSummary = async (videoId) => {
      try {
            const video = await findVideoById(videoId);

            if (!video.summary) {
                  throw new apiError(
                        404,
                        "Summary has not been generated for this video yet"
                  );
            }

            return {
                  videoId: video._id,
                  summary: video.summary,
                  generatedAt: video.summaryGeneratedAt,
            };
      } catch (error) {
            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle other errors
            throw new apiError(
                  500,
                  `Failed to get summary: ${error.message}`
            );
      }
};

export {
      generateAndStoreSummary,
      getExistingSummary,
};
