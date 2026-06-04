import { Router } from "express";
import {
      generateSummary,
      getSummary,
} from "../controllers/summary.controller.js";

const router = Router();

/**
 * POST /api/v1/videos/:videoId/generate-summary
 * Generate AI-powered summary for a video
 * - Submit video URL to AssemblyAI for transcription
 * - Poll for transcription completion
 * - Generate summary using Gemini AI
 * - Store summary and transcript in database
 */
router.post("/:videoId/generate-summary", generateSummary);

/**
 * GET /api/v1/videos/:videoId/summary
 * Retrieve existing summary for a video
 * - Returns summary and generation timestamp
 * - Returns 404 if summary hasn't been generated yet
 */
router.get("/:videoId/summary", getSummary);

export default router;
