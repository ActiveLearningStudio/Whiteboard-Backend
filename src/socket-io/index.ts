import * as WhiteBoard from "../models/whiteBoard";
import * as chatHistory from "../models/chatHistory";
import { COLORS } from "../utils/constants";
const SocketIOFile = require("socket.io-file");
const fs = require("fs");
//var MongoClient =require('mongodb').MongoClient;
import path from "path";

//var url="mongodb://localhost:27017/whiteboard";
export const EventType = {
  //connection events
  SERVER_USER_CONNECTED: "SERVER_USER_CONNECTED",
  SERVER_USER_DISCONNECTED: "SERVER_USER_DISCONNECTED",

  //user status events
  SERVER_ACTIVE_USERS: "SERVER_ACTIVE_USERS", // self listening event
  SERVER_UPDATE_USER_STATUS: "SERVER_UPDATE_USER_STATUS",
  CLIENT_USER_STATUS: "CLIENT_USER_STATUS",

  // content events
  CLIENT_UPDATE_BOARD: "CLIENT_UPDATE_BOARD",
  SERVER_UPDATED_BOARD: "SERVER_UPDATED_BOARD",

  // cursor events
  CLIENT_UPDATE_CURSOR: "CLIENT_UPDATE_CURSOR",
  SERVER_UPDATED_CURSOR: "SERVER_UPDATED_CURSOR",

  //chat events

  CLIENT_SEND_MESSAGE: "CLIENT_SEND_MESSAGE",
  SERVER_UPDATE_MESSAGE: "SERVER_UPDATE_MESSAGE",

  CLIENT_HISTORY_MESSAGE: "CLIENT_HISTORY_MESSAGE",
  SERVER_UPDATE_HISTORY_MASSAGE: "SERVER_UPDATE_HISTORY_MASSAGE",

  CLIENT_TYPING_MESSAGE: "CLIENT_TYPING_MESSAGE",
  SERVER_UPDATE_CLIENT_MESSAGE_STATUS: "SERVER_UPDATE_CLIENT_MESSAGE_STATUS",

  CLIENT_STOP_TYPING_MESSAGE: "CLIENT_STOP_TYPING_MESSAGE",
  SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE:
    "SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE",

  CLIENT_UPLOAD_IMAGE: "CLIENT_UPLOAD_IMAGE",
  SERVER_UPDATE_IMAGE_STATUS: "SERVER_UPDATE_IMAGE_STATUS",
};

/**
 * This is socket.io event 
 * This event will be fired when user draw any activity in board
 * This event will be fired when user doing a chat 
 */
export function initSocket(io: any) {
  io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.boardId) {
      let boardId = socket.handshake.query.boardId;
      console.log("board Id", boardId);
      WhiteBoard.getWhiteBoardById(boardId, (err, board) => {
        console.log("board", board);
        if (err || !board) {
          console.log("auth error 1");
          console.log("board Id", boardId);
          return next(new Error("Authentication error"));
        }

        //TODO: check for particapants list and authenticate socket
        const ActiveUserCount = board.activeUsers.length;
        var userObj = {
          id: socket.id,
          userName: socket.id.substring(socket.id.length - 4),
          status: "online",
          color: COLORS[Object.keys(COLORS)[ActiveUserCount]],
        };
        //upadte participants status in board
        updateParticapantsStatus(board, userObj, (err, result) => {
          if (err) {
            console.log("Falied to update active users");
          } else {
            console.log("updateParticapantsStatus:", result);
          }
        });
        socket.board = board;
        socket.user = userObj;
        next();
      });
    } else {
      console.log("auth error 2");
      next(new Error("Authentication error"));
    }
    // next();
    // MongoClient.connect(url,function(err,db){
    //   var messageCollection=db.collection('contentHistory')

    // })
  }).on("connection", function (socket) {
    //let messageCollection = db.collection('contentHistory')

    console.log("Socket IO Ready", socket.user);
    console.log("Socket IO Ready:" + socket.board.boardName + " connected");

    //======================= connection events ==================================================
    let connectedData = socket.user;

    console.log("Socket connected.");

    socket.broadcast.emit(
      EventType.SERVER_USER_CONNECTED + "-" + socket.board.boardId,
      connectedData
    );

    socket.emit(EventType.SERVER_ACTIVE_USERS, socket.board.activeUsers);

    // Update status: "away" or "online"
    socket.on(EventType.CLIENT_USER_STATUS + "-" + socket.board.boardId, (data) => {
      console.log("event:" + EventType.CLIENT_USER_STATUS + "-" + data.status);

      socket.user.status = data.status;
      console.log("User status", socket.user);

      io.emit(
        EventType.SERVER_UPDATE_USER_STATUS + "-" + socket.board.boardId,
        data
      );
    });

    //disconnect
    socket.on("disconnect", (reason) => {
      console.log("Reason:", reason);

      socket.user.status = "offline";
      let disconnectedData = socket.user;
      socket.broadcast.emit(
        EventType.SERVER_USER_DISCONNECTED + "-" + socket.board.boardId,
        disconnectedData
      );

      removeUserFromActiveUsers(socket.board, socket.user, (err, result) => {
        if (err) {
          console.log("Error:", err);
        } else {
          console.log("User removed from the active user list");
        }
      });
    });

    //======================= connection events end ==============================================

    //======================= content events  ===========================

    socket.on(
      EventType.CLIENT_UPDATE_BOARD + "-" + socket.board.boardId,
      (data) => {
        console.log(
          "event:" + EventType.CLIENT_UPDATE_BOARD + "-" + JSON.stringify(data)
        );

        data.updatedBy = socket.user;

        io.emit(EventType.SERVER_UPDATED_BOARD + "-" + socket.board.boardId, data);
      }
    );

    //======================= content events end ===========================

    //======================= cursor events  ===========================

    socket.on(
      EventType.CLIENT_UPDATE_CURSOR + "-" + socket.board.boardId,
      (data) => {
        console.log(
          "event:" + EventType.CLIENT_UPDATE_CURSOR + "-" + JSON.stringify(data)
        );

        data.user = socket.user;

        io.emit(EventType.SERVER_UPDATED_CURSOR + "-" + socket.board.boardId, data);
      }
    );

    //======================= cursor events end  ===========================

    //======================= chat events  ===========================

    socket.on(
      EventType.CLIENT_UPLOAD_IMAGE + "-" + socket.board.boardId,
      (data) => {
        console.log("data is ", data);
        console.log("event:" + EventType.CLIENT_UPLOAD_IMAGE + "-" + data);

        // data.user = socket.user;
        console.log("user data", data);
        io.emit(
          EventType.SERVER_UPDATE_IMAGE_STATUS + "-" + socket.board.boardId,
          data
        );
      }
    );

    socket.on(
      EventType.CLIENT_SEND_MESSAGE + "-" + socket.board.boardId,
      (data) => {
        console.log("data is ", data);
        console.log("event:" + EventType.CLIENT_SEND_MESSAGE + "-" + data);
        chatHistory.addChatHistory(socket.board.boardId, data, function (err, res) {
          console.log("Inserted a document into the contentHistory", res);
        });

        io.emit(EventType.SERVER_UPDATE_MESSAGE + "-" + socket.board.boardId, data);
      }
    );
    //======================= message typing  ===========================
    socket.on(
      EventType.CLIENT_TYPING_MESSAGE + "-" + socket.board.boardId,
      (data) => {
        console.log("data is ", data);
        console.log("event:" + EventType.CLIENT_TYPING_MESSAGE + "-" + data);

        // data.user = socket.user;
        console.log("user data", data);
        io.emit(
          EventType.SERVER_UPDATE_CLIENT_MESSAGE_STATUS +
            "-" +
            socket.board.boardId,
          data
        );
      }
    );

    //======================= stop message typing  ===========================

    socket.on(
      EventType.CLIENT_STOP_TYPING_MESSAGE + "-" + socket.board.boardId,
      (data) => {
        console.log("data is ", data);
        console.log(
          "event:" + EventType.CLIENT_STOP_TYPING_MESSAGE + "-" + data
        );

        // data.user = socket.user;
        console.log("user data", data);
        io.emit(
          EventType.SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE +
            "-" +
            socket.board.boardId,
          data
        );
      }
    );
  });
}

/**
 * Update a participant status
 * Find whiteboard group using board.boardId  if find
 * then user will add in whiteboard group and it status will updated offline to online
 */
function updateParticapantsStatus(board, updateObj, cb) {
  let currentActiveUsers = board.activeUsers;

  let userExist = currentActiveUsers.includes((e) => e.id === updateObj.id);

  console.log("userExist", userExist);

  if (userExist) {
    WhiteBoard.updateActiveUsers(board.boardId, updateObj, (err, result) => {
      if (err) {
        console.log("error:", err);
        cb(err, null);
      } else {
        console.log("updateActiveUsers:Success");
        cb(null, result);
      }
    });
  } else {
    WhiteBoard.addToActiveUsers(board.boardId, updateObj, (err, result) => {
      if (err) {
        console.log("error:", err);
        cb(err, null);
      } else {
        console.log("addToActiveUsers:sucess");
        cb(null, result);
      }
    });
  }
}
/**
 * Remove user a active users list
 * Find whiteboard group using board.boardId  if find
 * then user will remove from active users group and it status will updated online to offline
 */
function removeUserFromActiveUsers(board, userObj, cb) {
  WhiteBoard.removeFromActiveUsers(board.boardId, userObj, (err, result) => {
    if (err) {
      console.log("error:", err);
      cb(err, null);
    } else {
      console.log("removeFromActiveUsers:Success");
      cb(null, result);
    }
  });
}

// function imageUserUpload(board, userObj, cb) {
//   WhiteBoard.imageUpload(board.boardId, userObj, (err, result) => {
//     if (err) {
//       console.log("error:", err);
//       cb(err, null);
//     } else {
//       console.log("imageUpload:Success");
//       cb(null, result);
//     }
//   });
// }
