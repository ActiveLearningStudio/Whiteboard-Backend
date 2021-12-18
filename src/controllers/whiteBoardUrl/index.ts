import { Request, Response, NextFunction } from "express";
import idGenrators from "short-animal-id";
import crypto from "crypto";
import { config } from "../../config/config";
import * as whiteboardUrl from "../../models/whiteBoardUrl";
import * as Whiteboard from "../../models/whiteBoard";
import * as Client from "../../models/client";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import { makeRandomId } from "../whiteBoard";
import * as User from "../../models/user";

/** 
 * We take Org_Id, Obj_Id,Obj_type from clint and find in whiteboard  collection 
 * If it find we return previous genrated Url Otherwise we store in whiteboard collection.
 * Send url to client.
 * 
 **/

export async function CheckGetWhiteBoardUrl(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const bearerHeader = req.headers["authorization"];
    // checking token
    if (typeof bearerHeader !== "undefined") {
      const bearar = bearerHeader.split(" ");
      const beararToken = bearar[1];
      Client.confirmToken(beararToken, async (err: Error, data: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            isValid: false,
            error: ErrorCodes[1009],
          };
          logger.error(logger.LogModule.ROUTE, req.txId, "Error in confirm token = " + err)
          next();
          return;
        }
        if (data === null) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1102],
            data: "Un-Authorized Access ",
          };
          logger.error(logger.LogModule.ROUTE, null, "Error in check get whiteboard url= " + "Un-Authorized Access")
          next();
          return;
        }
        if (data.token !== null) {
          req.checkBody("org_id", "org_id is required").notEmpty();
          req.checkBody("obj_id", "obj_id is required").notEmpty();
          req.checkBody("obj_type", "obj_type is required").notEmpty();

          var errors = req.validationErrors();
          const payload = req.body;
          if (errors) {
            req.apiStatus = {
              isSuccess: false,
              error: ErrorCodes[1001],
              data: errors[0].msg,
            };
            logger.error(logger.LogModule.ROUTE, null, "Error in check get whiteboard url = " + errors[0].msg)
            next();
            return;
          }

          getUserDetails(payload.usr_id, payload.username, (userInfo) => {
            if (!userInfo) {
              req.apiStatus = {
                isSuccess: false,
                error: ErrorCodes[1107],
                data: err,
              };
              logger.error(logger.LogModule.ROUTE, req.txId, "Error in get user details = " + "User details not found")
              return next();
            }

            whiteboardUrl.queryWhiteBoardUrl({
              org_id: payload.org_id,
              obj_id: payload.obj_id,
              obj_type: payload.obj_type
            }, (err: Error, data: any) => {
              if (err) {
                req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1003],
                  data: err,
                };
                logger.error(logger.LogModule.ROUTE, req.txId, "Error in query whiteboard url= " + err)
                next();
                return;
              }

              payload.user = {
                user_id: userInfo.user_id,
                username: userInfo.username
              }

              if (data && data.id && data.url) {
                req.apiStatus = {
                  isSuccess: true,
                  data: {
                    isValid: true,
                    url: data.url + "?userId=" + payload.user.user_id,
                  },
                };
                logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard url retrieved");
                return next();
              }

              payload.team_id = req.body.team_id ? req.body.team_id : null;

              const clientData = JSON.stringify(req.body.org_id)
                .concat(JSON.stringify(req.body.obj_id))
                .concat(JSON.stringify(req.body.obj_type))

              payload.board_id = crypto.createHash('md5').update(clientData).digest('hex');
              payload.url = config.getUrl.concat(crypto.createHash('md5').update(clientData).digest('hex'));

              const whiteBoardObj: whiteboardUrl.IwhiteboardAccessUrlContentModel = new whiteboardUrl.whiteboardAccessUrlModel(payload);

              whiteboardUrl.saveWhiteBoardUrl(
                whiteBoardObj,
                (
                  err: any,
                  whiteBoard: whiteboardUrl.IwhiteboardAccessUrlContentModel[]
                ) => {
                  if (err || !whiteBoard) {
                    req.apiStatus = {
                      isSuccess: false,
                      error: ErrorCodes[1003],
                      data: { err, isValid: false },
                    };
                    logger.error(logger.LogModule.ROUTE, req.txId, "Error in save whiteboard url = " + err)
                    return next();
                  }

                  let whiteBoardBrdObj = { boardId: payload.board_id, boardName: 'Untitled'};

                  Whiteboard.createWhiteBoard(
                    whiteBoardBrdObj,
                    (err: any, whiteBoardTmp: Whiteboard.IWhiteBoardModel[]) => {
                      if (err || !whiteBoardTmp) {
                        req.apiStatus = {
                          isSuccess: false,
                          error: ErrorCodes[1002],
                          data: err,
                        };
                        logger.error(logger.LogModule.ROUTE, req.txId, "Error in create whiteboard object = " + err);
                        next();
                        return;
                      }
                    });

                  req.apiStatus = {
                    isSuccess: true,
                    data: {
                      isValid: true,
                      url: payload.url + "?userId=" + payload.user.user_id
                    },
                  };
                  logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "loaded whiteboard url");
                  //  console.log("whiteboardJson",whiteBoard)
                  return next();
                }
              );
            });

          });

        }
      });
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1102],
        data: { message: "Un-Authorized Access ", isValid: false },
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in check get whiteboard url = " + "Un-Authorized Access")
      return next();
    }
  } catch (error) {
    console.log("error occured " + error);
  }
}

/**
 *  Get user details 
 * Find user from userId(mongoId) and return user details
 */
function getUserDetails(user_id, username, cb) {

  let userObj: any = {
    user_id: user_id
      ? user_id
      : makeRandomId(20)
  };

  User.find(userObj, (err: Error, existingUser: any) => {
    if (err || !existingUser) {
      userObj.username = username ? username : idGenrators.animalId(),
        User.addUser(userObj, (err: Error, newUser: any) => {
          if (err || !newUser) {
            cb(null);
          } else {
            cb(newUser);
          }
        });
    } else {
      cb(existingUser);
    }
  });
}