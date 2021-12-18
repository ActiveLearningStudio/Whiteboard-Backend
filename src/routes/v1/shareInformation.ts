import express from "express";
import * as shareInformation from "../../controllers/shareInformation";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";

let router = express.Router();

/**
 * User sent post request to add share user information using /addShareInfo route
 */
router.post(
  "/addShareInfo",
  entryPoint,
  shareInformation.addShareInformation,
  exitPoint
);

module.exports = router;
