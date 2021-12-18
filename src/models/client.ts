import { Document, Schema, Model, model, Mongoose } from 'mongoose';
import path from 'path';

export interface IClient {
   name: string;
   email: string;
   clientId: string;
   secretKey: string;
   token: string;
}

export interface IClientModel extends IClient, Document {}

export const ClientSchema: Schema = new Schema(
   {
      name: String,
      email: { type: String },
      clientId: { type: String },
      secretKey: String,
      token: { type: String, default: null },
   },
   {
      usePushEach: true,
      bufferCommands: false,
      versionKey: false,
   }
);

ClientSchema.set('toObject', { virtuals: true });
ClientSchema.set('toJSON', { virtuals: true });

export const ClientModal: Model<IClientModel> = model<IClientModel>(
   'Client',
   ClientSchema,
   'auth0-tenant'
);

/**
 * check email is already exist in clinet collection 
 * if email exist then we send response email exist
 * 
 */
export var updateEmailCheck = function (email: any, cb: Function) {
   ClientModal.findOne({ email }, function (err, data) {
      cb(err, data);
   });
};

/**
 * check clientId is already exist in  clinet collection
 * if clientId exist then we send response clientId exist
 * 
 */
export var updateClientIdCheck = function (clientId: any, cb: Function) {
   ClientModal.findOne({ clientId }, function (err, data) {
      cb(err, data);
   });
};

/**
 * In query we find email or cliendId present or not in collection
 * If already exist in  clinet collection
 * i send response already exist 
 */
export var insertioncheckQuery = function (query: object, cb: Function) {
   ClientModal.findOne(query, function (err, data) {
      cb(err, data);
   });
};

/**
 * In query we find email or cliendId present or not in collection
 * If already exist in  clinet collection
 * i send response already exist 
 */
// check clientId or email is present for updation
export var updationcheckQuery = function (query: object, cb: Function) {
   ClientModal.findOne(query, function (err, data) {
      cb(err, data);
   });
};

/**
 * Get all clint information which is store already in client collection
 */
export var getAllClients = function (cb: Function) {
   ClientModal.find({}, function (err, data) {
      cb(err, data);
   });
};

/**
 * If get perticuler client information take clint Id 
 * Find in Client collection if clintId is exist  
 * Send client Information to user 
 */
export var getClientById = function (id: any, cb: Function) {
   ClientModal.findOne({ clientId: id }, function (err, data) {
      cb(err, data);
   });
};

/**
 * If get perticuler client information take Id(mongoId) 
 * Find in Client collection if Id is exist  
 * Send client Information to user 
 */
export var getIdDetails = function (id: any, cb: Function) {
   ClientModal.findOne({ _id: id }, function (err, data) {
      cb(err, data);
   });
};

/**
 * Store new client information In client collection
 */
export var addClientData = async function (data: any, cb: Function) {
   const user = new ClientModal(data);
   user.save((err, data) => {
      cb(err, data);
   });
};

/**
 * Update client information 
 * Take Id and find in collection when it find 
 * Update client data in client collection
 */
// update Client
export var updateClientData = async function (
   id: any,
   data: any,
   cb: Function
) {
   data.secretKey !== undefined
      ? await ClientModal.updateOne(
           { _id: id },
           {
              $set: {
                 name: data.name,
                 email: data.email,
                 clientId: data.clientId,
                 secretKey: data.secretKey,
              },
           },
           { upsert: false },
           (err, data) => {
              cb(err, data);
           }
        )
      : await ClientModal.updateOne(
           { _id: id },
           {
              $set: {
                 name: data.name,
                 email: data.email,
                 clientId: data.clientId,
              },
           },
           { upsert: false },
           (err, data) => {
              cb(err, data);
           }
     );
};

/**
 * Update client token information 
 * Take Id and find in collection when it find 
 * Update client token Information in client collection
 */
// update token
export var updateTokenData = async function (id: any, data: any, cb: Function) {
   await ClientModal.updateOne(
      { clientId: id },
      {
         $set: {
            token: data,
         },
      },
      { upsert: false },
      (err, data) => {
         cb(err, data);
      }
   );
};

/**
 *Delete client information 
 * Take Id and find in collection when it find 
 * remove client data from  client collection and update client collection
 */
// delete Client
export var deleteClientData = async function (id: any, cb: Function) {
   await ClientModal.remove({ _id: id }, { upsert: false }, (err, data) => {
      cb(err, data);
   });
};

/**
 * Check token
 * Take token and find in collection
 * If token is exist inclient collection send response already exist
 */
export var confirmToken = function (token: any, cb: Function) {
   ClientModal.findOne({ token }, function (err, data) {
      cb(err, data);
   });
};
