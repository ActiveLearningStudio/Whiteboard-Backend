import { Document, Schema, Model, model, Mongoose } from "mongoose";

export interface IBoardContent {
  boardId: String;
  content: [Object];
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IBoardContentModel extends IBoardContent, Document {}

export const BoardContentSchema: Schema = new Schema(
  {
    boardId: String,
    content: {
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

BoardContentSchema.set("toObject", { virtuals: true });
BoardContentSchema.set("toJSON", { virtuals: true });

export const BoardContentModel: Model<IBoardContentModel> =
  model<IBoardContentModel>("boardContent", BoardContentSchema);
/**
 * createBoardContent 
 * Take a new boardContent from user and store in bordContent collection in db
 * Send response to user
 */

export var createWhiteBoard = function (boardObj: any, cb: Function) {
  BoardContentModel.insertMany([boardObj], function (err, createdBoard) {
    cb(err, createdBoard);
  });
};

/**
 * addBoardContent by using boardId(mongoId)
 * It find perticuler add boardContent record in boardContent collection 
 * If find that boardContent record then add new boardContent and update record in db
 * Not find boardContent record in db then send error message  
 */

export var addBoardContent = function (
  boardId: any,
  newContent: any,
  cb: Function
) {
  BoardContentModel.findOneAndUpdate(
    { boardId },
    {
      $push: {
        content: newContent,
      },
    },
    { upsert: true, new: true },
    function (err, User) {
      cb(err, User);
    }
  );
};
/**
 * setBoardContent by using boardId(mongoId)
 * It find perticuler boardContent record in boardContent collection 
 * If find that boardContent record then set boardContent and update record in db
 * Not find boardContent record in db then send error message  
 */

export var setBoardContent = function (
  boardId: Schema.Types.ObjectId | any,
  newContent: any,
  cb: Function
) {
  BoardContentModel.findOneAndUpdate(
    { boardId },
    {
      $set: {
        content: newContent,
        modifiedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Find boardContent by using boardId(mongoId)
 * It find perticuler boardContent record in boardContent collection 
 * If find that boardContent record then remove boardContent and update record in db  
 * Not find boardContent record in db then send error message  
 */
export var removeBoardContent = function (boardId, content: any, cb: Function) {
  BoardContentModel.findOneAndUpdate(
    { boardId },
    {
      $pull: {
        content: { id: content.id },
      },
    },
    { new: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Find boardContent by using boardId(mongoId)
 * It find perticuler boardContent record in boardContent collection 
 * It find that boardContent record then send record to client
 * Not find boardContent record in db then send error message  
 */

export var getWhiteBoardById = function (boardId: any, cb: Function) {
  BoardContentModel.findOne({ boardId }, function (err, boardList) {
    cb(err, boardList);
  });
};
