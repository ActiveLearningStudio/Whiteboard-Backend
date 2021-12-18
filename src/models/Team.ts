import { Document, Schema, Model, model, Mongoose } from "mongoose";

export interface ITeamContent {
  teamName: string;
  participant: [Object];
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface ITeamContentModel extends ITeamContent, Document {}

export const TeamContentSchema: Schema = new Schema(
  {
    teamName: {
      type: String,
    },
    participant: {
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

TeamContentSchema.set("toObject", { virtuals: true });
TeamContentSchema.set("toJSON", { virtuals: true });

export const TeamContentModel: Model<ITeamContentModel> =
  model<ITeamContentModel>("Team", TeamContentSchema);

  /**
   * Get perticuler team information using id
   * If team is find then send team information to user 
   */
//getOne
export var getTeamById = function (id: any, cb: Function) {
  TeamContentModel.findOne({ _id: id }, function (err, teamList) {
    cb(err, teamList);
  });
};

  /**
   * Get perticuler team information using teamName
   * If team is find then send team information to user 
   */
export var getTeamByName = function (teamName: any, cb: Function) {
  TeamContentModel.findOne({ teamName: teamName }, function (err, teamList) {
    cb(err, teamList);
  });
};


  /**
   * Get perticuler team information using teamName,teamId,id
   * If team is find then send team information to user 
   */
//query
export var queryTeam = function (
  query,
  projection: any,
  options: any,
  cb: Function
) {
  TeamContentModel.find(query, projection, options, function (err, teamList) {
    cb(err, teamList);
  });
};

/**
 * Add new team information into team collection
 */
//create
export var createTeam = function (teamObj: any, cb: Function) {
  TeamContentModel.insertMany([teamObj], function (err, createTeam) {
    cb(err, createTeam);
  });
};

/**
 * Update team information using id
 * Find team in team collection 
 * If team is find then add updated information and update team collection
 */
//update
export var updateTeamById = function (
  id: Schema.Types.ObjectId | any,
  teamObj: any,
  cb: Function
) {
  TeamContentModel.updateOne(
    { _id: id },
    { $set: teamObj },
    { upsert: false },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Update team information using id
 * Find team in team collection 
 * If team is find then add updated information and update team collection
 * Oterwise create new entry in db 
 */

//Upsert
export var upsertTeam = function (query: object, teamObj: any, cb: Function) {
  TeamContentModel.updateOne(
    query,
    { $set: teamObj },
    { upsert: true },
    function (err, User) {
      cb(err, User);
    }
  );
};

/**
 * Delete team information using id
 * Find team in team collection 
 * If team is find then remove it from team collection 
 */
//delete
export var deleteTeam = (id: Schema.Types.ObjectId, cb: Function) => {
  TeamContentModel.deleteOne({ _id: id }, (err: any) => {
    cb(err);
  });
};

/**
 * Get all team  information from team collection
 */
export var getAllTeam = (cb: Function) => {
  TeamContentModel.find((err, responseList) => {
    cb(err, responseList);
  });
};

/**
 * Get perticuler team information using team id
 * Find a team from team collection
 * If team is find then send team information to user
 */
export var findTeamId = (teamId: Schema.Types.ObjectId, cb: Function) => {
  TeamContentModel.findById(teamId, { password: 0 }).exec((err, teamList) => {
    cb(err, teamList);
  });
};
