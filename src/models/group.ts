import { Document, Schema, Model, model, Mongoose } from 'mongoose';
import path from 'path';

export interface IGroup {
   name: string;
   description: string;
   image: string;
   users: [
      {
         user: string;
         role: string;
      }
   ];
   CreatedById: string;
}

export interface IGroupModel extends IGroup, Document {}

export const GroupSchema: Schema = new Schema(
   {
      name: { type: String, unique: true },
      description: { type: String },
      image: { type: String },
      users: [
         {
            user: { type: String, required: true },
            role: { type: String, default: 'admin', enum: ['admin', 'user'] },
         },
      ],
      CreatedById: { type: String },
   },
   {
      usePushEach: true,
      bufferCommands: false,
      versionKey: false,
   }
);

GroupSchema.set('toObject', { virtuals: true });
GroupSchema.set('toJSON', { virtuals: true });

export const GroupModal: Model<IGroupModel> = model<IGroupModel>(
   'Group',
   GroupSchema
);

/**
 * Create new Group
 * Take data and store into a group collection in db
 */
export var createGroup = async function (data: any, cb: Function) {
   const user = new GroupModal(data);
   user.save((err, data) => {
      cb(err, data);
   });
};

/**
 * Add new user into Group
 * Take groupId and find perticuler group in group collection 
 * If find then add a new user user information and update that collection
 */
export var addUserToGroup = async function (
   groupId: any,
   data: any,
   cb: Function
) {
   GroupModal.findByIdAndUpdate(
      { _id: groupId },
      {
         $push: {
            users: data,
         },
      },
      (err, data) => {
         cb(err, data);
      }
   );
};

/**
 * Add new user into Group
 * Take groupId and find perticuler group in group collection 
 * If find then find a user using  userId
 * if user is find remove user  from group and update that group collection
 */
export var removeUserToGroup = async function (
   groupId: any,
   userId: any,
   cb: Function
) {
   GroupModal.findByIdAndUpdate(
      { _id: groupId },
      {
         $pull: { users: { user: userId } },
      },
      (err, data) => {
         cb(err, data);
      }
   );
};

/**
 * check user present  in a Group or not 
 * Take groupId and find perticuler group in group collection 
 * If find then find a user using  userId
 * if user is find send that user information to user
 */
export var checkUserPresentInGroup = async function (
   groupId: any,
   userId: any,
   cb: Function
) {

   GroupModal.findOne(
      { _id: groupId, 'users.user': userId },
      function (err, data) {
         cb(err, data);
      }
   );
};

/**
 * get perticuler Group
 * Take groupId and find perticuler group in group collection 
 * If find then send group information to user
 */
export var getGroupById = async function (groupId: any, cb: Function) {
   GroupModal.findOne({ _id: groupId }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Get perticuler user
 * Find perticuler group and perticuler user using userId
 * If Group and user find then send that data to user
 */
export var isAdmin = async function (groupId: any, userId: any, cb: Function) {

   GroupModal.findOne(
      { _id: groupId, users: { $elemMatch: { user: userId } } },
      { 'users.$': 1 },
      function (err, data) {
         if (data) {
            cb(err, data.users[0].role);
         } else {
            cb(err, 'user');
         }
      }
   );
};

/**
 * Chane user role
 * Find perticuler group and perticuler user using changeId
 * If Group and user find change the role of user and update in database
 */
export var changeRole = async function (
   groupId: any,
   changeId: any,
   role: any,
   cb: Function
) {
   GroupModal.updateOne(
      {
         _id: groupId,
         'users.user': changeId,
      },
      {
         $set: {
            'users.$.role': role,
         },
      },
      function (err, data) {
         cb(err, data);
      }
   );
};
