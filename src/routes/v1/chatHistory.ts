import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { entryPoint } from "../../middlewares/entryPoint";
import { config } from "../../config/config";
import { exitPoint } from "../../middlewares/exitPoint";
import * as chatHistory from "../../controllers/chatHistory";

import path from "path";

/**
 * User send get request
 * Get perticuler chathistory using /:boardId route
 */

router.get("/:boardId", entryPoint, chatHistory.getChatHistory, exitPoint);

/**
 * User send get request
 * Get perticuler chathistory using /:boardId and searchTerm route
 */
router.get("/:boardId/:searchTerm", entryPoint, chatHistory.getChatSearch, exitPoint);

//router.post("/add", entryPoint, chatHistory.addWhiteboard, exitPoint);

module.exports = router;
