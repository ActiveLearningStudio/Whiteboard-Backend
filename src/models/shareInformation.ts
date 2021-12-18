import { Document, Schema, Model, model, Mongoose } from "mongoose";

export interface IShareInformation {
  id: string;
  user: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IShareInformationModel extends IShareInformation, Document {}

export const ShareInformationSchema: Schema = new Schema(
  {
    user: {
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

ShareInformationSchema.set("toObject", { virtuals: true });
ShareInformationSchema.set("toJSON", { virtuals: true });

export const ShareInformationModel: Model<IShareInformationModel> =
  model<IShareInformationModel>("shareUser", ShareInformationSchema);

  /**
   * Add a share user information in shareUser collection 
   */
//create
export var addShareInformation = function (user: any, cb: Function) {
  ShareInformationModel.insertMany([user], function (err, addShareInfo) {
    cb(err, addShareInfo);
  });
};

/**
 * Get perticuler user information using id(mongoId)
 */
//getOne
export var getShareInformationById = function (id: any, cb: Function) {

  ShareInformationModel.findOne({ _id: id }, function (err, userList) {
    cb(err, userList);
  });
};

//query
export var queryShareInformation = function (
  query,
  projection: any,
  options: any,
  cb: Function
) {
  ShareInformationModel.find(
    query,
    projection,
    options,
    function (err, userList) {
      cb(err, userList);
    }
  );
};
