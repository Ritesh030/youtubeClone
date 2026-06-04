import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiErrors.js";

/**
 * Find a video by ID
 * @param {string} videoId - The video ID
 * @returns {Promise<Object>} - The video document
 * @throws {apiError} - If video not found
 */
const findVideoById = async (videoId) => {
      try {
            if (!videoId || videoId.trim() === "") {
                  throw new apiError(400, "Video ID is required");
            }

            const video = await Video.findById(videoId);

            if (!video) {
                  throw new apiError(404, "Video not found");
            }

            return video;
      } catch (error) {
            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle MongoDB cast errors (invalid ID format)
            if (error.kind === "ObjectId") {
                  throw new apiError(400, "Invalid video ID format");
            }

            // Handle other errors
            throw new apiError(500, `Failed to find video: ${error.message}`);
      }
};

/**
 * Update video with transcript and summary
 * @param {string} videoId - The video ID
 * @param {Object} updateData - Data to update (transcript, summary, summaryGeneratedAt)
 * @returns {Promise<Object>} - The updated video document
 * @throws {apiError} - If update fails
 */
const updateVideoSummary = async (videoId, updateData) => {
      try {
            if (!videoId || videoId.trim() === "") {
                  throw new apiError(400, "Video ID is required");
            }

            // Validate update data
            if (!updateData || typeof updateData !== "object") {
                  throw new apiError(400, "Update data is required and must be an object");
            }

            const video = await Video.findByIdAndUpdate(
                  videoId,
                  {
                        $set: updateData,
                  },
                  {
                        new: true, // Return the updated document
                        runValidators: true, // Run schema validators
                  }
            );

            if (!video) {
                  throw new apiError(404, "Video not found");
            }

            return video;
      } catch (error) {
            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle MongoDB cast errors
            if (error.kind === "ObjectId") {
                  throw new apiError(400, "Invalid video ID format");
            }

            // Handle MongoDB validation errors
            if (error.name === "ValidationError") {
                  const messages = Object.values(error.errors)
                        .map((err) => err.message)
                        .join(", ");
                  throw new apiError(400, `Validation Error: ${messages}`);
            }

            // Handle other errors
            throw new apiError(500, `Failed to update video: ${error.message}`);
      }
};

/**
 * Get video summary only
 * @param {string} videoId - The video ID
 * @returns {Promise<Object>} - Object with summary and summaryGeneratedAt
 * @throws {apiError} - If video not found or summary not generated
 */
const getVideoSummary = async (videoId) => {
      try {
            if (!videoId || videoId.trim() === "") {
                  throw new apiError(400, "Video ID is required");
            }

            const video = await Video.findById(videoId).select(
                  "summary summaryGeneratedAt"
            );

            if (!video) {
                  throw new apiError(404, "Video not found");
            }

            if (!video.summary) {
                  throw new apiError(
                        404,
                        "Summary not generated yet for this video"
                  );
            }

            return {
                  summary: video.summary,
                  summaryGeneratedAt: video.summaryGeneratedAt,
            };
      } catch (error) {
            // Re-throw if already an apiError
            if (error instanceof apiError) {
                  throw error;
            }

            // Handle MongoDB cast errors
            if (error.kind === "ObjectId") {
                  throw new apiError(400, "Invalid video ID format");
            }

            // Handle other errors
            throw new apiError(500, `Failed to get video summary: ${error.message}`);
      }
};

export {
      findVideoById,
      updateVideoSummary,
      getVideoSummary,
};
