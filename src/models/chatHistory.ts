import { Document, Schema, Model, model, Mongoose } from "mongoose";

export interface IChatContent {
  boardId: string;
  message: object;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IChatContentModel extends IChatContent, Document {}

export const chatContentSchema: Schema = new Schema(
  {
    boardId: {
      type: String,
    },
    message: {
      type: Object,
      default: {},
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

chatContentSchema.set("toObject", { virtuals: true });
chatContentSchema.set("toJSON", { virtuals: true });

export const ChatContentModel: Model<IChatContentModel> =
  model<IChatContentModel>("chat", chatContentSchema);
  /**
 *get a chat history  by using boardId(mongoId)
 * It find perticuler chat history record in chat collection 
 * If find that chat history record then it send to user
 * Not find chat history record in db then send error message  
 */

//getOne
export var getChatHistoryByBoardId = function (boardId: any, cb: Function) {
  ChatContentModel.find({ boardId: boardId }, function (err, ChatList) {
    cb(err, ChatList);
  });
};


//query
export var queryTeam = function (
  query,
  projection: any,
  options: any,
  cb: Function
) {
  ChatContentModel.find(query, projection, options, function (err, chatList) {
    cb(err, chatList);
  });
};

  /**
 * add a new chat in chat history  by using boardId(mongoId)
 * It find perticuler chat history record in chat collection 
 * If find that chat history record then add new chat into them and update record in db
 * Not find chat history record in db then send error message  
 */
export var addChatHistory = function (
  boardId: String | any,
  newContent: any,
  cb: Function
) {
  //findOneAndUpdate
  const obj ={
    boardId:boardId ,
       
    
   message:newContent
  }
  ChatContentModel.insertMany(
    [
      obj
    ],

    
    { upsert: true, new: true },
    function (err, Chat) {
      cb(err, Chat);
    }
  );
};
  /**
 * create new chat history  
 * When user will chat that chat store in db
 */

//create
export var createChatHistory = function (chatHistoryObj: any) {
  return ChatContentModel.insertMany([chatHistoryObj]);
};

  /**
 * get a chat history  by using boardId(mongoId) an searchTerm
 * It find perticuler chat history record in chat collection 
 * If find that chat history record then it send to user that record
 * Not find chat history record in db then send error message  
 */
export var findSearchTerm = (
  boardId: String,
  searchTerm: any,
  cb: Function
) => {
  ChatContentModel.find(
    {
      boardId: boardId,
      "message.message": { $regex: searchTerm, $options: "i" },
    },
    function (err, ChatList) {
      console.log("findSearch Term ChatList", ChatList);
      cb(err, ChatList);
    }
  );
};
