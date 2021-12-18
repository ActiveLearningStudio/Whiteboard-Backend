import express from "express";
import * as BoardContent from "../../controllers/BoardContent";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";

let router = express.Router();
/**
 * User send post request 
 * Add board content using route /add
 */
router.post(
  "/add",
  entryPoint,
  BoardContent.addBoardContent,
  exitPoint
);

/**
 * User send post request 
 * clear board content using route /clearContent
 */
router.post(
  "/clearContent",
  entryPoint,
  BoardContent.clearContent,
  exitPoint
);

/**
 * User send get request 
 * Get perticuler boardcontent information using /:boardId route
 */
router.get(
  "/:boardId",
  entryPoint,
  BoardContent.getBoardContent,
  exitPoint
);

module.exports = router;
