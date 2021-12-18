import { Request, Response, NextFunction } from "express";
import * as ShareInformation from "../../models/shareInformation";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";

/** 
 * 
 *Add share user information
 * When share link for perticuler user that user information will take from req.body
 * And store into shareUser collection
 * 
 **/

export async function addShareInformation(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body;

    if (!payload) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        data: "Missing 'payload' or 'user information",
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in add share information = " + "missing payload !");
      next();
      return;
    }

    const shareInformationObj: ShareInformation.IShareInformationModel =
      new ShareInformation.ShareInformationModel(payload);

    ShareInformation.addShareInformation(
      shareInformationObj,
      (err: any, userShareInfo: ShareInformation.IShareInformationModel[]) => {
        if (err || !userShareInfo) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1002],
            data: err,
          };
          logger.error(logger.LogModule.ROUTE, req.txId, "Error in add share information = " + err);
          next();
          return;
        }
        req.apiStatus = {
          isSuccess: true,
          data: userShareInfo,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "User Information added");
        next();
      }
    );
  } catch (err) {
    console.error(err);
  }
}
