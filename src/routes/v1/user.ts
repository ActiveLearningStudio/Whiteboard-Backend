import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { entryPoint } from '../../middlewares/entryPoint';
import { config } from '../../config/config';
import { exitPoint } from '../../middlewares/exitPoint';
import * as User from '../../controllers/User';
import path from 'path';
/**
 * User send post request for add new user using /add-route route
 */
router.post('/add-user', entryPoint, User.addUserFunction, exitPoint);
/**
 * User send put request for update perticuler user using  /edit-user route
 */
router.put('/edit-user/:userId', entryPoint, User.editUserFunction, exitPoint);
/**
 * User send get request for get perticuler user using /get-user route
 */
router.get('/get-user/:id', entryPoint, User.getUserById, exitPoint);

module.exports = router;
