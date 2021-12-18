import { Request, Response, NextFunction } from "express";
import * as Whiteboard from "../../models/whiteBoard";
import { ErrorCodes } from "../../models/models";
import { config } from "../../config/config";
import {
  MailProvider,
  MessageType,
  TemplateType,
  ContentType,
  MailModel,
} from "../../integrations/email/mailModel";
import { sendMail } from "../../integrations/email";
import * as logger from "../../models/logs";

/** 
 * 
 * Check Invite link
 * Find whiteboard and match token
 * It take whiteboardId from req.query and Find whiteboard
 * If whiteboard is find then take token from req.query
 * Match the token to stored db token 
 * If Match send response successfully matchh
 * 
 **/

export function checkInviteLink(
  req: Request | any,
  res: Response,
  next: NextFunction
) {

  Whiteboard.getWhiteBoardById(req.query.id, (err: Error, Whiteboard: any) => {
    if (err || !Whiteboard) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in check invite link = " + err);
      next();
      return;
    }

    var whiteboardJson = JSON.parse(JSON.stringify(Whiteboard));

    if (whiteboardJson.inviteLinks.length) {
      whiteboardJson.inviteLinks.forEach((board) => {
        if (!req.query.token) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1001],
            data: "Missing whiteboard Url!",
          };
          logger.error(logger.LogModule.ROUTE, null, "Error in check invite link = " + "Missing whiteboardUrl");
          next();
          return;
        }
        if (board.tokenId === req.query.token) {
          req.apiStatus = {
            isSuccess: true,
            data: {
              message: `Successfully match.`,
              role: board.role,
            },
          };
          logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "token match");
          next();
          return;
        }
      });
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1009],
        data: "Invite Link Missing!",
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in check invite link  = " + "Invite link missing");
      next();
      return;
    }
  });
}

/** 
 * 
 * Send Invite link
 * Get perticuler whiteboard record using whiteboardId (mongoId)
 * It take  whiteboardId (mongoId) from req.body
 * Find whiteboard by userID (mongoId) in whiteboard collection 
 * If whiteboard record get then
 * We take link from Db and send it via mail
 * 
 **/
export function sendInviteLink(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  Whiteboard.getWhiteBoardById(req.body.id, (err: Error, Whiteboard: any) => {
    if (err || !Whiteboard) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in send invite link = " + err);
      next();
      return;
    }

    var fromMail = config.senderEmailId;
    var fromName = config.senderName;
    var to = req.body.email;
    var messageType = MessageType.HTML_TYPE;
    var subject = "Invite Link";
    var mailData = new MailModel(
      config.emailAuthKey,
      fromMail,
      fromName,
      to,
      subject,
      messageType
    );
    var whiteboardJson = JSON.parse(JSON.stringify(Whiteboard));

    if (whiteboardJson.inviteLinks.length) {
      whiteboardJson.inviteLinks.forEach((board) => {
        if (!req.body.role) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1001],
            data: "invalid role!",
          };
          logger.error(logger.LogModule.ROUTE, null, "Error in send invite link = " + "invalid role");
          next();
          return;
        }
        if (board.role === req.body.role) {
          var templateData = {
            inviteLinks: board.url,
          };
          mailData.setTemplateId("WHITEBOARD-101");
          mailData.setTemplateData(templateData);
          sendMail(
            config.mailProvider,
            mailData,
            function (err: Error, result: any) {
              if (err) {
                req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1009],
                  data: "invalid email!",
                };
                logger.error(logger.LogModule.ROUTE, req.txId, "Error in send invite link = " + "invalid email" + err);
                next();
                return;
              } else {
                console.log("mail has sent.");
                req.apiStatus = {
                  isSuccess: true,
                  data: {
                    message: `Mail has Successfully sent`,
                    link: board.url,
                  },
                };
                logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "mail has sent successfully");
                next();
                return;
              }
            }
          );
        }
      });
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1009],
        data: "req body Missing!",
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in send invite link = " + "request body missing");
      next();
      return;
    }
  });
}
