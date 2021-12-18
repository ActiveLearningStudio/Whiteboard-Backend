import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import * as BoardContent from "../../models/boardContent";
import * as HistoryContent from "../../models/contentHistory";
import * as Whiteboard from "../../models/whiteBoard";

/**
 * Add Board content old board
 * Find whiteboard using boardId 
 * If whiteboard is find then add that boardContent 
 */
export function addBoardContentOld(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("action", "action is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add board content old = " +errors[0].msg );
    next();
    return;
  }

  const payload = req.body;

  if (
    !payload ||
    !payload.content ||
    Object.keys(payload.content).length === 0
  ) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing new content",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add board content old = " + "Missing new content");
    next();
    return;
  }

  if (payload.action === "add") {
    BoardContent.addBoardContent(
      payload.boardId,
      payload.content,
      (err: any, dbContent: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
          };
          
          logger.error(
            logger.LogModule.ROUTE,
            req.txId,
            "Error in adding content: " + err
          );
          next();
          return;
        }

      //  console.log("exe here first");
        req.apiStatus = {
          isSuccess: true,
          data: dbContent,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content retrieved");
        next();
      }
    );
  } else {
    BoardContent.removeBoardContent(
      payload.boardId,
      payload.content,
      (err: any, updatedContent: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
          };
          logger.error(
            logger.LogModule.ROUTE,
            req.txId,
            "Error in removing content: " + err
          );
          next();
          return;
        }

        req.apiStatus = {
          isSuccess: true,
          data: updatedContent,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content updated");
        next();
      }
    );
  }
}

/**
 * Add Board content 
 * Find whiteboard using boardId 
 * If whiteboard is find then add that boardContent 
 */
export function addBoardContent(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("action", "action is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add board content = " + errors[0].msg);
    next();
    return;
  }

  const payload = req.body;
 

  if (
    !payload ||
    !payload.newContent
  ) {
    // console.log("payload.content", payload.newContent);
    // console.log("payload", Object.keys(payload.newContent).length);
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing new content",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add board content = " + "missing new content");
    next();
    return;
  }

  if (payload.action === "add") {
    BoardContent.setBoardContent(
      payload.boardId,
      payload.newContent,

      (err: any, dbContent: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
          };
          logger.error(
            logger.LogModule.ROUTE,
            req.txId,
            "Error in adding content: " + err
          );
          next();
          return;
        }
  

        //Update whiteboard modifiedAt
        Whiteboard.updateWhiteBoardContent(
          payload.boardId,
          null,
          (err, res) => {
            if (err) {
              console.log("error  :: failed to update modifiedAt");
              logger.error(logger.LogModule.ROUTE, null, "Error = " + err);
            }
            console.log("success :: whiteBoard modifiedAt updated");
          }
        );
      //  console.log("dbContent", dbContent);

        const obj = {
          boardId: payload.boardId,
          content: dbContent.content,
          createdAt: dbContent.createdAt,
          version: dbContent.version,
          modifiedAt: dbContent.modifiedAt,
        };

        HistoryContent.createHistoryContent(
          [obj],

          (err: any, dbContent: any) => {
            if (err || !dbContent) {
              req.apiStatus = {
                isSuccess: false,
                error: ErrorCodes[1002],
                data: err,
              };
              logger.error(logger.LogModule.ROUTE, req.txId, "Error in create content history = " + err);
              next();
              return;
            }

            req.apiStatus = {
              isSuccess: true,
              data: dbContent,
            };
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content retrieved");
            next();
          }
        );
      }
    );
  } else {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1003],
      data: "Missing action. Ex: {action: add}",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in add board content = " + "missing content");
  }
}

/**
 * Get perticuler boardcontent
 * Find a whiteboard using boardId 
 * If whiteborad is find then take a boardContent from db 
 * Send response to user 
 */
export function getBoardContent(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const boardId = req.params.boardId;

  if (!boardId) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing boardId",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in get board content = " + "missing board id");
  }

  BoardContent.getWhiteBoardById(boardId, (err: any, dbContent: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(
        logger.LogModule.ROUTE,
        req.txId,
        "Error in fetching content: " + err
      );
      next();
      return;
    }
    if (dbContent) {
      req.apiStatus = {
        isSuccess: true,
        data: dbContent,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content retrieved");
      next();
    } else {
      req.apiStatus = {
        isSuccess: true,
        data: [],
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content retrieved");
      next();
    }
  });
}
/**
 * Clear content
 * Find a whiteboard using boardId
 * If whiteboard is find then we clear a boardContent from db 
 * And update new board content there
 */
export function clearContent(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("action", "action is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in clear content = " + errors[0].msg);
    next();
    return;
  }

  const payload = req.body;


  if (!payload || !payload.newContent) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing new content",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in clear content function = " + "missing new content");
    next();
    return;
  }

  if (payload.action === "clear") {
    BoardContent.setBoardContent(
      payload.boardId,
      payload.newContent,

      (err: any, dbContent: any) => {
        if (err) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: err,
          };
          logger.error(
            logger.LogModule.ROUTE,
            req.txId,
            "Error in adding content: " + err
          );
          next();
          return;
        }

        //Update whiteboard modifiedAt
        Whiteboard.updateWhiteBoardContent(
          payload.boardId,
          null,
          (err, res) => {
            if (err) {
              logger.error(logger.LogModule.ROUTE, req.txId, "Error in update whiteboard content = " + err);
            }
          //  console.log("success :: whiteBoard modifiedAt updated");
          }
        );
        req.apiStatus = {
          isSuccess: true,
          data: dbContent,
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "content retrieved");
        next();
      }
    );
  } else {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1003],
      data: "Missing action. Ex: {action: clear}",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in clear content = " + "missing action ");
    next();
    return;
  }
}
