import { Request, Response, NextFunction } from "express";
import { config } from "../../config/config";
import * as Whiteboard from "../../models/whiteBoard";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import shortId from "shortid";


/**
 * 
 * Get all letest updated(modified) whiteboards
 * It will be find and take letest  whiteboard record from whiteboard collection
 * 
 **/
export function getAllWhiteboard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  var page;
  var limit;

  try {
    if (req.query.page && parseInt(req.query.page) > 1) {
      page = parseInt(req.query.page);
    }

    if (req.query.limit && parseInt(req.query.limit) > 0) {
      limit = parseInt(req.query.limit);
    }
  } catch (err) {
    console.log("invalid query params " + err);
  }
  const startIndex = (page - 1) * limit;
 
  Whiteboard.queryWhiteBoard(
    {},
    {},

    { sort: { modifiedAt: -1 }, skip: startIndex, limit: limit },

    (err: Error, Whiteboard) => {
      if (err) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1003],
          data: err,
        };
        logger.error(logger.LogModule.ROUTE, req.txId, "Error in query whiteboard = " + err);
        next();
        return;
      }
      if (Object.keys(req.query).length === 0) {
        req.apiStatus = {
          isSuccess: true,
          data: Whiteboard,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboards retrieved");
      }

      req.apiStatus = {
        isSuccess: true,
        data: Whiteboard,
      };
       logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboards retrieved");
      next();
    }
  );
}
/** 
 * 
 * Get perticuler whiteboard record using whitebordId (mongoId)
 * It take  whitebordId (mongoId) from req.param 
 * Find whiteboard in whiteboard collection
 * 
 **/
export function getWhiteBoard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const whiteboardId: any = req.params.whiteboardId;

  if (!whiteboardId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing whiteboard Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in get whiteboard = " + "Missing whiteboard Id");
    next();
    return;
  }

  Whiteboard.getWhiteBoardById(whiteboardId, (err: Error, Whiteboard: any) => {
    if (err || !Whiteboard) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in find whiteboard by Id = " + err);
      next();
      return;
    }

    var whiteboardJson = JSON.parse(JSON.stringify(Whiteboard));
    req.apiStatus = {
      isSuccess: true,
      data: whiteboardJson,
    };
    logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard retrieved");
    next();
  });
}

/** 
 * 
 * Create or add new whiteboard record and store in whiteboard collection
 * It take data from user via req.body like boardName and create whiteaboard
 * When whiteboard is created that time it create invitelink for differnt differnt role and store in whiteboard collection
 * 
 **/
export function addWhiteboard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  //check for whiteBoard in body
  //check if user is signed in and has role as admin

  let payload: any = req.body;
  if (!payload) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing 'payload' or 'boardName",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add whiteboard = " + "missing paylaod");
    next();
    return;
  }

  let whiteBoardObj: Whiteboard.IWhiteBoardModel =
    new Whiteboard.WhiteBoardModel(payload);

  let boardObjId = getId();
  whiteBoardObj["boardId"] = `${boardObjId}${shortId.generate()}`;

  Whiteboard.createWhiteBoard(
    whiteBoardObj,
    (err: any, whiteBoard: Whiteboard.IWhiteBoardModel[]) => {
      if (err || !whiteBoard) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          data: err,
        };
        logger.error(logger.LogModule.ROUTE, req.txId, "Error in create whiteboard object = " + err);
        next();
        return;
      }

      let token = [] as any;
      for (let i = 0; i < 5; i++) {
        let ele = makeRandomId(15);
        token.push(ele);
      }

      const urlObj = [
        {
          url: config.url
            .concat("id=", whiteBoard[0].boardId)
            .concat("&token=", token[0]),
          tokenId: token[0],
          role: "canView",
        },
        {
          url: config.url
            .concat("id=", whiteBoard[0].boardId)
            .concat("&token=", token[1]),
          tokenId: token[1],
          role: "canEdit",
        },
        {
          url: config.url
            .concat("id=", whiteBoard[0].boardId)
            .concat("&token=", token[2]),
          tokenId: token[2],
          role: "canComment",
        },
        {
          url: config.url
            .concat("id=", whiteBoard[0].boardId)
            .concat("&token=", token[3]),
          tokenId: token[3],
          role: "temporaryAccess",
        },
      ];
      urlObj.forEach((object) => {
        whiteBoard[0].inviteLinks.push(object);
      });

      Whiteboard.updateWhiteBoardById(
        whiteBoard[0].boardId,
        whiteBoard[0],
        (err, res) => {
          if (err) {
            console.log("error :: invitelLinks not updated");
            logger.error(logger.LogModule.ROUTE, req.txId, "Error = " + err);
          }
        //  console.log("Successfully updated");
        }
      );
      req.apiStatus = {
        isSuccess: true,
        data: whiteBoard,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard created");
      next();
    }
  );
}

/** 
 * 
 * Update perticuler whiteboard record using whitebordId (mongoId)
 * It take  whitebordId (mongoId) from req.param and data will take from req.body 
 * Find whiteboard by whitebordId (mongoId) in whiteboard collection and update record
 * 
 **/

export function updateWhiteBoard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const whiteboardId: any = req.params.whiteboardId;
  const payload: any = req.body;

  if (!whiteboardId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing whiteboard Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in update whiteboard = " + "Missing whiteboardId")
    next();
    return;
  }

  if (!payload) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing Payload (Ids)",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in update whiteboard= " + "missing payload")
    next();
    return;
  }

  var boardJson: any = JSON.parse(JSON.stringify(payload));

  Whiteboard.updateWhiteBoardById(
    whiteboardId,
    boardJson,
    (err: any, response: any) => {
      if (err) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          data: err,
        };
        logger.error(logger.LogModule.ROUTE, req.txId, "Error in update whiteboard by id= " + err);
        next();
        return;
      }

      req.apiStatus = {
        isSuccess: true,
        data: "Whiteboard Updated",
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard updated");
      next();
    }
  );
}

/** 
 * 
 * Uppload board image  using whitebordId (mongoId)
 * It take  whitebordId (mongoId) from req.param and file will take from req.file 
 * After uploading image it will genrate image location url.
 * Find whiteboard by  whitebordId (mongoId)in whiteboard collection and update whiteboard with image location url.
 * 
 **/
export function updateBoardImage(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const whiteboardId: any = req.params.whiteboardId;

  // const payload: any = req.body;
  if (!whiteboardId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing whiteboard Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in update whiteboard image = " + "Missing whiteboardId")
    next();
    return;
  }

  if (req.file && req.file.path) {
    let data = {};
    let type = req.file.filename.split(".");
    if (req.file.filename.match(/\.(png|jpg)$/)) {
      (data["fileUrl"] = config.uploadImgPath + req.file.filename),
        (data["fileType"] = type[1]);
    } else if (
      req.file.filename.match(
        /\.(png|jpg|pdf|doc|docx|csv|xls|xlsx|avi|mp4|mpeg|oga|ogv|ogx|rar|zip|txt|ogg|ppt|pptx)$/
      )
    ) {
      (data["fileUrl"] = config.uploadPdfPath + req.file.filename),
        (data["fileType"] = type[1]);
    } else {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1006],
        data: "Please upload image or file.",
      };
      logger.error(logger.LogModule.ROUTE, null, "Error in update whiteboard image = " + "Please upload image or file.")
      next();
      return;
    }
    //  let fileType = req.file.filename.match(/\.(png|jpg|pdf)$/) ? type[1] : "";

    Whiteboard.updateWhiteBoardById(
      whiteboardId,
      { imageUrl: Object.values(data)[0] },
      (err: any, response: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1002],
            data: err,
          };
          logger.error(logger.LogModule.ROUTE, req.txId, "Error in update whiteboard by id = " + err);
          next();
          return;
        }

        req.apiStatus = {
          isSuccess: true,
          data: data,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "Board image updated");
        next();
      }
    );
  } else {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1004],
      data: "No image or file found",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error = " + "No image or file found")
    next();
    return;
  }
}

/** 
 * 
 * Delete perticuler whiteboard record using whitebordId (mongoId).
 * It take  whitebordId (mongoId) from req.param.
 * Find whiteboard by whitebordId (mongoId)in whiteboard collection and delete record from collection.
 * 
 **/
export function removeWhiteboard(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const whiteboardId: any = req.params.whiteboardId;

  if (!whiteboardId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing whieboard Id!",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in remove whiteboard = " + "Missing whieboard Id!")
    next();
    return;
  }

  Whiteboard.deleteWhiteBoard(whiteboardId, (err: any, result: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1005],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in delete whiteboard= " + err);
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: "WhiteBoard Deleted",
    };
    logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard deleted");
    next();
  });
}
//===================================================================//

function getId() {
  var newTime = Math.floor(new Date().getTime());
  console.log(newTime);
  return newTime.toString(36);
}

// Genrate random string 
export const makeRandomId = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
