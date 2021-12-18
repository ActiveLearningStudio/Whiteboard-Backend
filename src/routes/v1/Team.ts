import express from "express";
import * as Team from "../../controllers/Team";
import { entryPoint } from "../../middlewares/entryPoint";
import { exitPoint } from "../../middlewares/exitPoint";

let router = express.Router();
/**
 * User send Post request for add new team using /add route
 */
router.post(
  "/add",
  entryPoint,
  Team.addTeam,
  exitPoint
);
/**
 * User send get request for get all teams using /all route
 */
router.get("/all",Team.getAllTeam, exitPoint);

/**
 * User send get request for get perticuler team using /teamId route
 */
router.get("/:teamId", entryPoint,Team.getTeam, exitPoint);

/**
 * User send put request for update perticuler team using /update route
 */

router.put(
  "/update/:teamId",
  entryPoint,
 Team.updateTeam,
  exitPoint
);

/**
 * User send delete request for delete perticuler team using /remove route
 */
router.delete(
  "/remove/:teamId",
  entryPoint,
 Team.removeTeam,
  exitPoint
);

module.exports = router;
