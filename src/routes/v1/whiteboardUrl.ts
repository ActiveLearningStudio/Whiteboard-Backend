import express from "express";
import * as whiteBoardAccessUrl from "../../controllers/whiteBoardUrl";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";

let router = express.Router();

/**
 * User send post request using /getWhiteboardUrl
 */
router.post(
  "/getWhiteboardUrl",
  entryPoint,
  whiteBoardAccessUrl.CheckGetWhiteBoardUrl,
  exitPoint
);

//router.get("get_whiteboardUrl",whiteboardaccessUrl.getWhiteboardaccessUrl, exitPoint);

//router.get("client/:teamId", entryPoint,whiteboardaccessUrl.getSingleClient, exitPoint);

module.exports = router;
