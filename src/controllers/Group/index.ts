import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/config';
import * as User from '../../models/user';
import * as Group from '../../models/group';
import { ErrorCodes } from '../../models/models';
import * as logger from '../../models/logs';

/** 
 * 
 * Create Group
 * we take data from req.body and take file path fron req.file.path
 * Creating one object and store into Group collection with user role and userId
 * 
 **/
async function createTheGroup(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   const { userId, name, description } = req.body;
   const image = req.file ? req.file.path : req.body.image;

   let initialGroup = {
      name,
      description,
      image,
      users: [
         {
            user: userId,
            role: 'admin',
         },
      ],
      createdById: userId,
   };

   Group.createGroup(initialGroup, (err: any, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1002],
            data: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in create group = " + err);
         next();
         return;
      }
      if (data) {
         req.apiStatus = {
            isSuccess: true,
            data: data,
         };
         logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "group created");
         next();
         return;
      } else {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1002],
            data: err,
         };
         logger.error(logger.LogModule.ROUTE, null, "Errorvin create group = " + err);
         next();
         return;
      }
   });
}

/** 
 * 
 * Create Group
 * Get perticuler User record using userId (mongoId)
 * It take  userID (mongoId) from req.param
 * Find user by userID (mongoId) in User collection 
 * If User record get then  call create Group function
 * 
 **/
export async function createGroupFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      User.getUserById(req.body.userId, (err: any, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1002],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in create group function = " + err);
            next();
            return;
         }
         if (data) {
            return createTheGroup(req, res, next);
         } else {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1003],
               data: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in create group function = " + err);
            next();
            return;
         }
      });
   } catch (error) {
      console.log(error);
   }
}

/** 
 * 
 * Add user in to Group
 * It take  groupId (mongoId) from req.param
 * Find group by groupId (mongoId) in Group collection 
 * If group find then  add user into group
 * 
 **/
// add user to Group
async function addUserData(
   req: Request | any,
   res: Response,
   next: NextFunction,
   id: any
) {
   let userObj = {
      user: id,
      role: 'user',
   };

   Group.addUserToGroup(req.params.groupId, userObj, (err: any, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in add user in group = " + err);
         next();
         return;
      }
      if (data) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1105],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in add user in group = " + data);
         next();
         return;
      } else {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
         };
         logger.error(logger.LogModule.ROUTE, null, "Error in add user in group = " + "user not added");
         next();
         return;
      }
   });
}

/** 
 * 
 * Get groupId fron req.param and User data from req.body
 * Find group by groupId (mongoId) in Group collection 
 * If group record get then  call add User function for adding a data into group
 * 
 **/
export async function addUserToGroupFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { groupId } = req.params;
      const { username } = req.body;

      Group.getGroupById(groupId, (err: any, group: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1009],
               group: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in add user to group function  = " + err);
            next();
            return;
         }
         if (group) {
            User.getUserByUsername(username, (err: any, data: any) => {
               if (err) {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1003],
                     data: err,
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in get User by name  = " + err);
                  next();
                  return;
               }
               if (data) {
                  //  check user already pressent in group
                  Group.checkUserPresentInGroup(
                     groupId,
                     data._id,
                     (err: any, user: any) => {
                        if (err) {
                           req.apiStatus = {
                              isSuccess: false,
                              error: ErrorCodes[1003],
                              data: err,
                           };
                           logger.error(logger.LogModule.ROUTE, req.txId, "Error in check user present in group = " + err);
                           next();
                           return;
                        }

                        if (user) {
                           req.apiStatus = {
                              isSuccess: false,
                              error: ErrorCodes[1106],
                              data: err,
                           };
                           logger.error(logger.LogModule.ROUTE, req.txId, "Error in check user present in group = " + "user");
                           next();
                           return;
                        } else {
                           return addUserData(req, res, next, data._id);
                        }
                     }
                  );
               } else {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1107],
                     data: err,
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in get user by user name = " + err);
                  next();
                  return;
               }
            });
         } else {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1108],
            };
            logger.error(logger.LogModule.ROUTE, null, "Errorin add user to group function = " + "group not found");
            next();
            return;
         }
      });
   } catch (error) {
      console.log(error);
   }
}
/** 
 * 
 * Remove User from group
 * remove perticuler User from group using userId (mongoId)
 * first find the Group using groupId it take from req.param
 * If Group find  then 
 * Find user by userID (mongoId) in User collection 
 * If User record get then  remove the user from group
 * 
 **/
// remove user from group
async function removeUserFromGroup(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   const { groupId } = req.params;
   const { userId } = req.body;

   User.getUserById(userId, (err: any, data: any) => {
      if (err) {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1009],
            group: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in get user by Id in remove user function= " + err);
         next();
         return;
      }
      if (data) {
         Group.checkUserPresentInGroup(
            groupId,
            userId,
            (err: any, user: any) => {
               if (err) {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1107],
                     group: err,
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in check user present in group = " + err);
                  next();
                  return;
               }
               if (user) {
                  Group.removeUserToGroup(
                     groupId,
                     userId,
                     (err: any, data: any) => {
                        if (err) {
                           req.apiStatus = {
                              isSuccess: false,
                              error: ErrorCodes[1005],
                              group: err,
                           };
                           logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove user from group = " +err);
                           next();
                           return;
                        }
                        if (data) {
                           req.apiStatus = {
                              isSuccess: true,
                              message: 'User removed successfully',
                           };
                           logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "user removed successfully");
                           next();
                           return;
                        } else {
                           req.apiStatus = {
                              isSuccess: false,
                              error: ErrorCodes[1005],
                              group: err,
                           };
                           logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove user from group= " + err);
                           next();
                           return;
                        }
                     }
                  );
               } else {
                  req.apiStatus = {
                     isSuccess: false,
                     error: ErrorCodes[1107],
                     group: err,
                  };
                  logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove user from group = " + err);
                  next();
                  return;
               }
            }
         );
      } else {
         req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1107],
            group: err,
         };
         logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove user from group = " + err);
         next();
         return;
      }
   });
}

/** 
 * 
 * Remove User from group
 * remove perticuler User from group using userId (mongoId)
 * first find the Group using groupId it take from req.param
 * If Group find  then 
 * Find user by userID (mongoId) in User collection 
 * If User record get then  remove the user from group
 * 
 **/
export async function removeUserFromGroupFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      // removerId = who is removing
      // userId = user to remove
      const { groupId } = req.params;

      Group.getGroupById(groupId, (err: any, group: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1009],
               group: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in remove user from group function = " + err);
            next();
            return;
         }
         if (group) {
            removeUserFromGroup(req, res, next);
         } else {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1108],
            };
            logger.error(logger.LogModule.ROUTE, null, "Error in remove user from group function = " + "user not removed");
            next();
            return;
         }
      });
   } catch (error) {
      console.log(error);
   }
}

/** 
 * Change user Role
 * We take groupId from req.param and find perticuler group
 * If Group is find then find the perticuler user by userId
 * If user found then change role 
 **/
// change role
async function changeUserRole(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { groupId } = req.params;
      const { role, userId } = req.body;
      Group.changeRole(groupId, userId, role, (err: any, data: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1009],
               group: err,
            };
            logger.debug(logger.LogModule.ROUTE, req.txId, "Error in change user role = " + err);
            next();
            return;
         }
         if (data.n > 0 || data.nmodified > 0) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1112],
            };
            logger.error(logger.LogModule.ROUTE, null, "Error in change role function = " + "data");
            next();
            return;
         } else {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1113],
               group: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in change role function = " + err);
            next();
            return;
         }
      });
   } catch (error) {
      console.log(error);
   }
}

/** 
 * Change user Role
 * We take groupId from req.param and find perticuler group
 * If Group is find then find the perticuler user by userId
 * If user found then change role 
 **/
export async function changeRoleFunction(
   req: Request | any,
   res: Response,
   next: NextFunction
) {
   try {
      const { groupId } = req.params;

      Group.getGroupById(groupId, (err: any, group: any) => {
         if (err) {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1009],
               group: err,
            };
            logger.error(logger.LogModule.ROUTE, req.txId, "Error in change role function= " + err);
            next();
            return;
         }
         if (group) {
            changeUserRole(req, res, next);
         } else {
            req.apiStatus = {
               isSuccess: false,
               error: ErrorCodes[1108],
            };
            logger.error(logger.LogModule.ROUTE, null, "Error in change role function = " + "failed to chage user role");
            next();
            return;
         }
      });
   } catch (error) {
      console.log(error);
   }
}
