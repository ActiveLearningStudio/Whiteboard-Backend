import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import * as BoardContent from "../../models/boardContent";
import * as HistoryContent from "../../models/contentHistory";
import { error } from "winston";
/**
 * Get boardContent history 
 * Find perticuler boardContent gistory by using boardId 
 * If boardContentHistory find then take content will send to user
 */
export function getHistoryContentByUser(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  // let boardId = req.params.id;
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("userName", "userName is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in get history content by user= " + errors[0].msg);
    next();
    return;
  }

  let boardId = req.body.boardId;
  let userId = req.body.userName;

  HistoryContent.getHistoryContent(boardId, userId, (err, content) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in get story content = " + err);
      next();
      return;
    } else {
      req.apiStatus = {
        isSuccess: true,
        data: content,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard contentretrieved");
      next();
    }
  });
}

/**
 * undo boardContent history 
 * Find perticuler boardContent gistory by using boardId 
 * If boardContentHistory find then find board content using boardId
 * If it is find then remove that content and add new content there and update collection
 */
export function undoContent(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  // let boardId = req.params.id;
  req.checkBody("undoIndex", "undoIndex is required").notEmpty();
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("userName", "userName is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in undo content = " + errors[0].msg);
    next();
    return;
  }

  let undoIndex = req.body.undoIndex;
  let boardId = req.body.boardId;
  let userId = req.body.userName;

  HistoryContent.getHistoryContent(boardId, userId, (err, content) => {
    if (err) {
      console.log("Error:", err);
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in get content history = " + err);
      next();
      return;
    } else {
     

      // content = JSON.parse(JSON.stringify(content))
      var userContent =
        content[0] && content[0].userContent && content[0].userContent.length
          ? content[0].userContent
          : [];


      if (userContent && userContent.length) {
        let arrayIndex = userContent.length - undoIndex;

        // userContent =JSON.parse(JSON.stringify(userContent))
        let undoObj = userContent[arrayIndex];

       // console.log("undoObj", undoObj);

        try {
          //reomve from board content
          BoardContent.removeBoardContent(
            boardId,
            undoObj,
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

              //   console.log("dbContent", dbContent);

              req.apiStatus = {
                isSuccess: true,
                data: updatedContent,
              };
              logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "whiteboard content updated");
              next();
            }
          );
        } catch (error) {
            req.apiStatus = {
                isSuccess: false,
                error: ErrorCodes[1003],
                data: "Error:Undo object not found",
              };
              logger.error(logger.LogModule.ROUTE, null, "Error in undo content = " + "undo object not found");
              next();
              return;
        }
      } else {
        console.log("Error: there is no content to undo");
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1003],
          data: "Error: there is no content to undo",
        };
        logger.error(logger.LogModule.ROUTE, null, "Error in undo content = " + "there is no content to undo");
        next();
        return;
      }
    }
  });
}

/**
 * redo boardContent history 
 * Find perticuler boardContent gistory by using boardId 
 * If boardContentHistory find then find board content using boardId
 * If it is find then  add new content there and update collection
 */
export function redoContent(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  // let boardId = req.params.id;
  req.checkBody("redoIndex", "redoIndex is required").notEmpty();
  req.checkBody("boardId", "boardId is required").notEmpty();
  req.checkBody("userName", "userName is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in redo content= " + errors[0].msg);
    next();
    return;
  }

  let redoIndex = req.body.redoIndex;
  let boardId = req.body.boardId;
  let userId = req.body.userName;

  HistoryContent.getHistoryContent(boardId, userId, (err, content) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        data: err,
      };
      logger.error(logger.LogModule.ROUTE, req.txId, "Error in redo content = " + err);
      next();
      return;
    } else {
      var userContent =
        content[0] && content[0].userContent && content[0].userContent.length
          ? content[0].userContent
          : [];

      if (userContent && userContent.length) {
        let arrayIndex = userContent.length - redoIndex;

        let redoObj = userContent[arrayIndex];

        //Add to board content
        BoardContent.addBoardContent(
          boardId,
          redoObj,
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
            logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "board content retrieved");
            next();
          }
        );
      } else {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1003],
          data: "Error: there is no content to redo",
        };
        logger.error(logger.LogModule.ROUTE, null, "Error in redo content= " + "no content redo");
        next();
        return;
      }
    }
  });
}
