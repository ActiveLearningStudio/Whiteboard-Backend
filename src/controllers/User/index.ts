import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/config';
import * as User from '../../models/user';
import { ErrorCodes } from '../../models/models';
import * as logger from '../../models/logs';

async function ValidateEmail(email) {
   const mailformat =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   if (email.match(mailformat)) {
      return true;
   } else {
      return false;
   }
}

/** 
 * 
 * Create new user
 * It take data from req.body and check email valid or not 
 * If email is valid then we pass data to userModel for creating new user 
 * After creating it store into Db
 * 
 **/
export async function addUserFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { username, email, contact_number } = req.body;

      let checkEmail = await ValidateEmail(email);
      if (!checkEmail) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1103],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in add user function validate email  = " + "Email is invalid")
         next();
         return;
      }

      let userObj = {
         username,
         email,
         contact_number,
      };

      User.addUser(userObj, (err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1008],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in add user function = " + err)
            next();
            return;
         }

         req.apiStatus = {
            isSuccess: true,
            data,
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "user created");
         next();
      });
   } catch (error) {
      console.log(error);
   }
}
/** 
 * 
 * Update perticuler user data using userId (mongoId)
 * It take userId(mongoId) from req.param and data will take from req.body 
 * Check email Validation if valid then
 * Find user by userId(mongoId) in users collection and update user data
 * 
 **/

export async function editUserFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { userId } = req.params;
      const { username, email, contact_number } = req.body;

      //   check email
      let checkEmail = await ValidateEmail(email);
      if (!checkEmail) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1103],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in edit user function = " + "email is invailed")
         next();
         return;
      }

      //   if correct Email insert
      let userObj = {
         username,
         email,
         contact_number,
      };

      User.editUser(userId, userObj, (err: Error, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1008],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error  in edit user = " + err);
            next();
            return;
         }

         req.apiStatus = {
            isSuccess: true,
            data,
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "User updated");
         next();
      });
   } catch (error) {
      console.log(error);
   }
}

/** 
 * 
 * Get perticuler user data using userId (mongoId)
 * It take userId(mongoId) from req.param  
 * Find user by userId(mongoId)in users collection 
 * After getting user send response with data
 * 
 **/
export async function getUserById(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      if (!req.params.id) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1107],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in get user by id = " + "UserId required")
         next();
         return;
      }

      User.getUserByUserId(req.params.id, (err: any, data: any) => {
         if (err || !data) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1114],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in get user by user id = " + err);
            next();
            return;
         }
         req.apiStatus = {
            isSuccess: true,
            data,
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "user retrieved");
         next();
         return;
      });
   } catch (error) {
      console.log(error);
   }
}