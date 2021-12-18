import { Document, Schema, Model, model, Mongoose } from 'mongoose';
import path from 'path';

export interface IUser {
   user_id: string;
   username: string;
   email: string;
   contact_number: string;
}

export interface IUserModel extends IUser, Document { }

export const UserSchema: Schema = new Schema(
   {
      user_id: { type: String, unique: true },
      username: { type: String },
      email: { type: String },
      contact_number: { type: String },
   },
   {
      usePushEach: true,
      bufferCommands: false,
      versionKey: false,
   }
);

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

export const UserModel: Model<IUserModel> = model<IUserModel>(
   'User',
   UserSchema
);

/**
 * Add new user information 
 * Take data from user and store in user collection
 */
export var addUser = async function (data: any, cb: Function) {
   const user = new UserModel(data);
   user.save((err, data) => {
      cb(err, data);
   });
};

/**
 * update user information 
 * Find user using id if user is find
 * Add updated information in user collection
 */
export var editUser = async function (id: any, data: any, cb: Function) {
   await UserModel.updateOne(
      { _id: id },
      {
         $set: {
            username: data.username,
            email: data.email,
            contact_number: data.contact_number,
         },
      },
      { upsert: false },
      (err, data) => {
         cb(err, data);
      }
   );
};

/**
 * Get perticuler user information using id(mongoId)
 * Find user perticuler user fron user collection 
 * If user is find then send response to user
 */
export var getUserById = async function (id: any, cb: Function) {
   UserModel.findOne({ _id: id }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Get perticuler user information using userid(mongoId)
 * Find user perticuler user fron user collection 
 * If user is find then send response to user
 */
export var getUserByUserId = async function (user_id: any, cb: Function) {
   UserModel.findOne({ user_id }, function (err, data) {
      cb(err, data);
   });
};
/**
 * Get perticuler user information using username
 * Find user perticuler user fron user collection 
 * If user is find then send response to user
 */
export var getUserByUsername = async function (username: any, cb: Function) {
   UserModel.findOne({ username }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Get perticuler user information using any one like userId,username,id 
 * Find user perticuler user fron user collection 
 * If user is find then send response to user
 */
export var find = async function (query: any, cb: Function) {
   UserModel.findOne(query, function (err, data) {
      cb(err, data);
   });
};

