import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
      generateAndStoreSummary,
      getExistingSummary,
} from "../services/summary.service.js";

const generateSummary = asyncHandler(async (req, res) => {
      try {
            const { videoId } = req.params;

            // Validate videoId
            if (!videoId || videoId.trim() === "") {
                  throw new apiError(400, "Video ID is required");
            }

            // Generate summary
            const result = await generateAndStoreSummary(videoId);

            // Return success response
            return res
                  .status(200)
                  .json(
                        new apiResponse(
                              200,
                              {
                                    videoId: result.videoId,
                                    summary: result.summary,
                                    generatedAt: result.generatedAt,
                              },
                              "Video summary generated successfully"
                        )
                  );
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
});

const getSummary = asyncHandler(async (req, res) => {
      try {
            const { videoId } = req.params;

            // Validate videoId
            if (!videoId || videoId.trim() === "") {
                  throw new apiError(400, "Video ID is required");
            }

            // Get existing summary
            const result = await getExistingSummary(videoId);

            // Return success response
            return res
                  .status(200)
                  .json(
                        new apiResponse(
                              200,
                              {
                                    videoId: result.videoId,
                                    summary: result.summary,
                                    generatedAt: result.generatedAt,
                              },
                              "Video summary retrieved successfully"
                        )
                  );
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
});

export { generateSummary, getSummary };