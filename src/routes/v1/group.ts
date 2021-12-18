import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { entryPoint } from '../../middlewares/entryPoint';
import { config } from '../../config/config';
import { exitPoint } from '../../middlewares/exitPoint';
import * as Group from '../../controllers/Group';
import multer from 'multer';
import shortId from 'shortid';
import path from 'path';

// category image code
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      multer({ dest: `uploads/group-image/` });
      cb(null, `uploads/group-image/`);
   },
   filename: function (req, file, cb) {
      cb(null, shortId.generate() + '-' + file.originalname);
   },
});

const upload = multer({ storage });

/**
 * User sent post request
 * create group using /create-group route
 */
router.post(
   '/create-group',
   entryPoint,
   upload.single('image'),
   Group.createGroupFunction,
   exitPoint
);

/**
 * User sent put request
 * add user to existing group using /add-user-to-group route
 */
router.put(
   '/add-user-to-group/:groupId',
   entryPoint,
   Group.addUserToGroupFunction,
   exitPoint
);

/**
 * User sent put request
 * remove user to existing group using /remove-user-to-group route
 */
router.put(
   '/remove-user-from-group/:groupId',
   entryPoint,
   Group.removeUserFromGroupFunction,
   exitPoint
);

/**
 * User sent put request
 * change user role using /change-role route
 */
router.put(
   '/change-role/:groupId',
   entryPoint,
   Group.changeRoleFunction,
   exitPoint
);

module.exports = router;
