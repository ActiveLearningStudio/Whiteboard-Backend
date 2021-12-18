import mongoose = require("mongoose");
// import { createBoardOnStartUp } from "../seed/addBoard";
import * as logger from "../models/logs";

/**
 * Here connect mongoose to mongoDb
 */
export class DB {
  // Mongoose won't retry an initial failed connection.
  private static db: any;
  public getDB() {
    return DB.db;
  }
  public connectWithRetry(uri: string) {
    return mongoose.connect(
      uri,
      {
        bufferMaxEntries: 0,
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      },
      (err: Error) => {
        if (err) {
          console.log(
            "Mongoose failed initial connection. Retrying in 5 seconds..."
          );
          logger.error("Mongo db connection", null, "error = " + "Connection failed. retrying..");
          setTimeout(() => {
            this.connectWithRetry(uri);
          }, 5000);
        } else {
          mongoose.Promise = global.Promise;
          DB.db = mongoose.connection;
        }
      }
    );
  }

  public connectionClose(callback: Function) {
    mongoose.connection.close(function () {
      console.log("Mongoose connection closed.");

      if (callback) {
        callback();
      }
    });
  }
}

mongoose.connection.on("error", function (err) {
  console.log("Mongoose error: " + err);
});

mongoose.connection.on("connected", function () {
  console.log("Mongoose connected.");
  logger.debug("Mongo db connection", null, "sucess = " + "Mongoose connected.");
  //createBoardOnStartUp();  //remove in production
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose disconnected.");
  logger.error("Mongo db connection", null, "error = " + "Mongoose disconnected");
});
