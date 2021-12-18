import express from "express";
import * as BoardContent from "../../controllers/BoardContent";
import * as HistoryContent from "../../controllers/contentHistory";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";

let router = express.Router();

/**
 * User sent post request
 * get history content by user using /userContent route
 */
router.post(
  "/userContent",
  entryPoint,
  HistoryContent.getHistoryContentByUser,
  exitPoint
);

/**
 * User sent post request
 * undo the board content using /undo route
 */
router.post(
  "/undo",
  entryPoint,
  HistoryContent.undoContent,
  exitPoint
);

/**
 * User sent post request
 * redo the board content using /redo route
 */
router.post(
  "/redo",
  entryPoint,
  HistoryContent.redoContent,
  exitPoint
);

module.exports = router;
