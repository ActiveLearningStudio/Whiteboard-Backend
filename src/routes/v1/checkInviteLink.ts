import express from "express";
const router = express.Router();
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";
import * as checkInviteLink from "../../controllers/checkInviteLink";

/**
 * User sent get request
 * check invite link using /checkUrl route
 */
router.get("/checkUrl", entryPoint, checkInviteLink.checkInviteLink, exitPoint);

/**
 * User sent post request
 * send invite link using /link route
 */
router.post("/link", entryPoint, checkInviteLink.sendInviteLink, exitPoint);

module.exports = router;
