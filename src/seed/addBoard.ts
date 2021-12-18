import * as WhiteBoard from "../models/whiteBoard";
import * as logger from "../models/logs";
import { ObjectId } from "mongodb";


/**
 * Create on default whiteboard record
 * When server is start it automatically add a default whiteboard entry in whiteboard collection
 */
// export function createBoardOnStartUp() {
    
//   let boardObj = {
//     boardName: "Admin-Board",
//   };

//   WhiteBoard.getWhiteBoardByName(boardObj.boardName, (err, result) => {
//     if (err) {
//       logger.error(logger.DEFAULT_MODULE, null, "error = " + err);
//       return;
//     }

//     if (!result) {
//         WhiteBoard.createWhiteBoard(boardObj, (err, data) => {
//             if (err) {
//               logger.error(logger.DEFAULT_MODULE, null, "error = " + err);
//             } else {
//               // console.log("seed user", data[0]._id);
//               if (data[0]._id) {
//                 logger.debug(
//                   logger.DEFAULT_MODULE,
//                   null,
//                   `WhiteBoard: ${data[0]._id} created on start up`
//                 );
//               } else {
//                 logger.debug(
//                   logger.DEFAULT_MODULE,
//                   null,
//                   `Failed to seed admin board: ${boardObj.boardName}`
//                 );
//               }
//             }
//           });
//     }
//   });
// }
