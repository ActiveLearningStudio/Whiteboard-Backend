import { Document, Schema, Model, model, Mongoose } from "mongoose";

export interface IwhiteboardAccessUrlContent {
  org_id: string;
  obj_id: string;
  obj_type: string;
  user: [object]; //objectArray
  team_id: string;
  url: string;
  board_id: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IwhiteboardAccessUrlContentModel
  extends IwhiteboardAccessUrlContent,
    Document {}

export const whiteboardAccessUrlSchema: Schema = new Schema(
  {
    org_id: {
      type: String,
      require: true,
    },
    obj_id: {
      type: String,
      require: true,
    },
    obj_type: {
      type: String,
      require: true,
    },
    user: {
      type: [Object],
      default: [],
    },
    team_id: {
      type: String,
    },
    board_id: {
      type: String,
    },
    url: {
      type: String,
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

whiteboardAccessUrlSchema.set("toObject", { virtuals: true });
whiteboardAccessUrlSchema.set("toJSON", { virtuals: true });

export const whiteboardAccessUrlModel: Model<IwhiteboardAccessUrlContentModel> =
  model<IwhiteboardAccessUrlContentModel>(
    "whiteboardaccessUrl",
    whiteboardAccessUrlSchema
  );

  /***
   * Check whiteboard url present in collection or not
   * Find url in whiteboard collection using query like id,clientId
   * If it is find then send that url information to clint
   */
//query
export var queryWhiteBoardUrl = function (query, cb: Function) {
  whiteboardAccessUrlModel.findOne(query, function (err, list) {
    cb(err, list);
  });
};

/**
 * save whiteboard url in whiteboardaccess collection
 */
//create
export var saveWhiteBoardUrl = function (whiteObj: any, cb: Function) {
  whiteboardAccessUrlModel.insertMany(
    [whiteObj],
    function (err, createdGetWhiteBoardUrl) {
      cb(err, createdGetWhiteBoardUrl);
    }
  );
};


