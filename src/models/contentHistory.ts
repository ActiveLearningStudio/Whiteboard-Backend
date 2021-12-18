import { Document, Schema, Model, model, Mongoose } from "mongoose";
import { BoardContentModel } from "./boardContent";
const { ObjectId } = require("mongodb");

export interface IContentHistoryt {
  boardId: string;
  content: [Object];
  version: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IContentHistorytModel extends IContentHistoryt, Document {}

export const ContentHistorySchema: Schema = new Schema(
  {
    boardId: String,
    content: {
      type: [Object],
      default: [],
    },
    version: {
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

ContentHistorySchema.set("toObject", { virtuals: true });
ContentHistorySchema.set("toJSON", { virtuals: true });

export const ContentHistorytModel: Model<IContentHistorytModel> =
  model<IContentHistorytModel>("contentHistory", ContentHistorySchema);

/**
 * CreateHistoryContent
 * Take id from obj.boardId and find letest boardContent
 * If it find then create version wise content
 */
export var createHistoryContent = function ([obj], cb: Function) {
  obj.version = "1.0";
  let modifiedAt;

  ContentHistorytModel.find(
    { boardId: obj.boardId },
    { modifiedAt: 1, version: 1 }
  )
    .sort({ modifiedAt: -1 })
    .limit(1)
    .exec((err, result) => {
      if (result.length > 0) {
        obj.version = result[0].version || "1.0";
        modifiedAt = result[0].modifiedAt;
        let previousDay = modifiedAt.getDate();
        let today = new Date();
        let Today = today.getDate();

        if (previousDay < Today) {
          obj.version = (parseInt(obj.version) + 1.0).toFixed(1); // -> 2.1
        } else if (previousDay === Today) {
          obj.version = (parseFloat(obj.version) + 0.1).toFixed(1); // -> 1.2
        }
      }
      ContentHistorytModel.insertMany([obj], function (err, createdBoard) {
        cb(err, createdBoard);
      });
    });
};

/**
 * get perticuler HistoryContent
 * Take boardId  and find that boardContent
 * If it find then we send that perticuler board content  to user
 */
export var getHistoryContent = function (
  boardId: Schema.Types.ObjectId | any,
  userId: any,
  cb: Function
) {
  ContentHistorytModel.aggregate(
    [
      {
        $match: {
          boardId,
        },
      },
      {
        $project: {
          userContent: {
            $filter: {
              input: "$userContent",
              as: "content",
              cond: {
                $and: [
                  { $eq: ["$$content.username", userId] },
                  // {$eq: ["$$content.visiblity", true]}
                ],
              },
            },
          },
        },
      },
    ],
    function (err, User) {
      cb(err, User);
    }
  );
};
