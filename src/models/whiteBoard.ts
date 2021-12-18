import { Document, Schema, Model, model, Mongoose } from "mongoose";
import path from "path";

interface InviteLinks {
  url: string;
}

export interface IWhiteBoard {
  boardId: string;
  boardName: string;
  imageUrl: string;
  owner: Schema.Types.ObjectId;
  participants: [object];
  inviteLinks: [InviteLinks];
  activeUsers: [object];
  shapes: [object];
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IWhiteBoardModel extends IWhiteBoard, Document {}

export const WhiteBoardSchema: Schema = new Schema(
  {
    boardName: String,
    boardId: String,
    owner: Schema.Types.ObjectId,
    imageUrl: String,
    participants: {
      type: [Object],
      default: [],
    },
    inviteLinks: {
      type: [Object],
      default: [],
    },
    shapes: {
      type: [Object],
      default: [],
    },
    activeUsers: {
      type: [Object],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false,
  }
);

WhiteBoardSchema.set("toObject", { virtuals: true });
WhiteBoardSchema.set("toJSON", { virtuals: true });

export const WhiteBoardModel: Model<IWhiteBoardModel> = model<IWhiteBoardModel>(
  "whiteboard",
  WhiteBoardSchema
);

/**
 * Get perticuler whiteboard information using id
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then send whiteboard information to user
 */
//getOne
export var getWhiteBoardById = function (boardId: any, cb: Function) {
  WhiteBoardModel.findOne({ boardId }, function (err, boardList) {
    console.log("boardList", boardList);
    cb(err, boardList);
  });
};

/**
 * Get perticuler whiteboard information using boardName
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then send whiteboard information to user
 */
export var getWhiteBoardByName = function (boardName: any, cb: Function) {
  WhiteBoardModel.findOne({ boardName: boardName }, function (err, boardList) {
    cb(err, boardList);
  });
};

/**
 * Get perticuler whiteboard information using any like id ,boardName
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then send whiteboard information to user
 */
//query
export var queryWhiteBoard = function (
  query,
  projection: any,
  options: any,
  cb: Function
) {
  WhiteBoardModel.find(query, projection, options, function (err, boardList) {
    cb(err, boardList);
  });
};

/***
 * Add new board information in whiteboard collection
 * Take whiteboard data from user and store it in whiteboard collection
 */
//create
export var createWhiteBoard = function (boardObj: any, cb: Function) {
  WhiteBoardModel.insertMany([boardObj], function (err, createdBoard) {
    cb(err, createdBoard);
  });
};

/**
 * Update perticuler whiteboard information using id
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then add new information and update whiteboard collection
 */
//update
export var updateWhiteBoardById = function (
  boardId: any,
  boardObj: any,
  cb: Function
) {
  WhiteBoardModel.updateOne(
    { boardId },
    { $set: boardObj },
    { upsert: false },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Update perticuler whiteboardContent information using id
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then add new information and update whiteboard collection
 */
export var updateWhiteBoardContent = function (
  boardId: any,
  newContent: any,
  cb: Function
) {
  WhiteBoardModel.findOneAndUpdate(
    { boardId },
    {
      $set: {
        modifiedAt: new Date(),
      },
    },
    { upsert: true, new: true },
    function (err, User) {
      cb(err, User);
    }
  );
};
/**
 * Update perticuler whiteboard information using id
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then add new information and update whiteboard collection
 * If not find then create new whiteboard record in whiteboard collection
 */
//Upsert
export var upsertWhiteBoard = function (
  query: object,
  boardObj: any,
  cb: Function
) {
  WhiteBoardModel.updateOne(
    query,
    { $set: boardObj },
    { upsert: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Update perticuler whiteboard participants user information using id
 * Find perticuler whiteboard from whiteboard collection
 * If whiteboard is find then add updated participant information and update whiteboard collection
 * If not find then create new whiteboard record in whiteboard collection
 */
//findByIdandUpdate participants
export var addToActiveUsers = function (boardId, updateObj: any, cb: Function) {
  WhiteBoardModel.findOneAndUpdate(
    { boardId },
    {
      $push: {
        activeUsers: updateObj,
      },
    },
    { upsert: true, new: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

//update active users --> if user exit in actice user list
/**
 * Check user is present in active user or not
 * Find perticuler whiteboard bu using whiteboardId and check user is present or not in active user
 * If present then show  updated user information
 */

export var updateActiveUsers = function (
  boardId,
  updateObj: any,
  cb: Function
) {
  WhiteBoardModel.findOneAndUpdate(
    { boardId, "activeUsers.id": updateObj.id },
    {
      $set: {
        "activeUsers.$": updateObj,
      },
    },
    { new: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Check user is present in active user or not
 * Find perticuler whiteboard bu using whiteboardId and check user is present or not in active user
 * If present then remove it from active user  show updated active user information
 */
export var removeFromActiveUsers = function (
  boardId,
  updateObj: any,
  cb: Function
) {
  WhiteBoardModel.findOneAndUpdate(
    { boardId },
    {
      $pull: {
        activeUsers: { id: updateObj.id },
      },
    },
    function (err, User) {
      cb(err, User);
    }
  );
};

/***
 * Delete whiteboar recordusing id
 * Find perticuler whiteboard record
 * If it is find then remove from whiteboard collection
 */
//delete
export var deleteWhiteBoard = (id: any, cb: Function) => {
  WhiteBoardModel.deleteOne({ boardId: id }, (err: any) => {
    cb(err);
  });
};

/***
 * Get all whiteboard information
 * Find all whiteboard from whiteboard collection 
 * Send it to user
 */
export var getAllWhiteboard = (cb: Function) => {
  WhiteBoardModel.find((err, responseList) => {
    cb(err, responseList);
  });
};

/***
 * Get perticuler whiteboard information
 * Find perticuler whiteboard using id
 * If whiteboard is find then send that whiteboard information to user
 */
// export var findWhiteBoardId = (
//   whiteboardId: any,
//   cb: Function
// ) => {
//   WhiteBoardModel.findById(whiteboardId, { password: 0 }).exec(
//     (err, boardList) => {
//       cb(err, boardList);
//     }
//   );
// };
