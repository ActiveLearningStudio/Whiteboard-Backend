import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";
import * as BoardContent from "../../models/boardContent";
import * as chatHistory from "../../models/chatHistory";

export function createChatHistory(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let boardId: any = req.socket.board.boardId;
  let message = req.data;

  if (!boardId || !message) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing 'boardId' or 'message",
    };
    next();
    return;
  }
  const chatHistoryObj: chatHistory.IChatContentModel =
    new chatHistory.ChatContentModel(boardId, message);

  // chatHistory.createChatHistory(
  //   chatHistoryObj,
  //   (err: any, chatHistory: chatHistory.IChatContentModel[]) => {
  //     if (err || !chatHistory) {
  //       req.apiStatus = {
  //         isSuccess: false,
  //         error: ErrorCodes[1002],
  //         data: err,
  //       };
  //       next();
  //       return;
  //     }

  //       req.apiStatus = {
  //       isSuccess: true,
  //       data: chatHistory,
  //     };
  //     next();
  //   }
  // );
}

/**
 *Get perticuler user chat
 * Find perticuler user chat  using boardId
 * If chat is find then send chat response to user
 */

export function getChatHistory(
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
    logger.error(logger.LogModule.ROUTE, null, "Error in get chat history = " + "missing board Id");
  }

  chatHistory.getChatHistoryByBoardId(boardId, (err: any, dbContent: any) => {
   
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
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "chat retrieved");
      next();
    } else {
      req.apiStatus = {
        isSuccess: true,
        data: dbContent,
      };
      logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "chat retrieved");
      next();
    }
  });
}

/**
 * Get chat
 * Find chat using search term
 * If chat is find then send that chat response to user
 */

export function getChatSearch(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const boardId = req.params.boardId;

  const searchTerm = req.params.searchTerm;

  if (!boardId || !searchTerm) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing details",
    };
    logger.error(logger.LogModule.ROUTE, null, "Error in get chat search = " + "missing details");
    next();
    return
  }

  chatHistory.findSearchTerm(
    boardId,
    searchTerm,
    (err: any, searchContent: any) => {
      if(err){
        req.apiStatus = {
          isSuccess :false ,
          error:ErrorCodes[1003]
        }
        logger.error(logger.LogModule.ROUTE, null, "Error in find search term = " + err);
        next();
        return;
      }
      if (searchContent) {
        req.apiStatus = {
          isSuccess: true,
          data: {
            key: searchTerm,
            result: searchContent,
          },
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "chat retrieved");
        next();
      } else {
        req.apiStatus = {
          isSuccess: true,
          data: {
            key: searchTerm,
            result: searchContent,
          },
        };
        logger.debug(logger.LogModule.ROUTE, null, "sucess = " + "chat searched by search term");
        next();
      }
    }
  );
}
