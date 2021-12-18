import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import * as http from "http";
import * as logger from "./models/logs";
// import * as Token from "./models/accesstoken";
// import * as Users from "./models/users";
import { ResponseObj } from "./models/models";
// import passport from "passport";
// import BearerStrategy from "passport-http-bearer";
import path from "path";
import errorhandler from "errorhandler";
var expressValidator = require("express-validator");
require("dotenv").config();

import { DB } from "./models/db";

import * as Socket from "./socket-io/index";

const app = express();

const server = http.createServer(app);
const db = new DB();
const port = config.port || 8000;
const mongodbURI: string = config.mongodbURI;
const LABEL = config.serviceName;

app.set("port", port);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cors());
//Express Validator
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);
// swagger using json file
var options = {
  explorer: true,
};

/**
 * Genrate a swagger documentation 
 */
app.use(
  "/api-docs",
  swaggerUi.serveFiles(swaggerDocument, options),
  swaggerUi.setup(swaggerDocument)
);
   // init socket
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
Socket.initSocket(io);

// init socket-ends

if ("development" === app.get("env")) {
  logger.info(
    logger.DEFAULT_MODULE,
    null,
    "Running in Development Environment ."
  );
  app.use(errorhandler());
}

// app.use(passport.initialize());

// Bring in the database!
db.connectWithRetry(mongodbURI);

// passport strategy
// passport.use(
//   new BearerStrategy.Strategy(function (token, done) {
//     //logger.debug("Passport Token: " + token);
//     Token.findByToken(token, function (err: Error, tokenFromDb: any) {
//       if (err) {
//         let responseObj = new ResponseObj(401, "Unauthorized", undefined);
//         return done(err, false, responseObj.toJsonString());
//       }
//       if (!tokenFromDb) {
//         let responseObj = new ResponseObj(401, "Unauthorized", undefined);
//         return done(null, false, responseObj.toJsonString());
//       }
//       Users.findById(tokenFromDb.userId, function (err: Error, user: any) {
//         if (err) {
//           let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
//           return done(err, false, responseObj.toJsonString());
//         }
//         if (!user) {
//           let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
//           return done(null, false, responseObj.toJsonString());
//         }
//         return done(null, user, { scope: "all", message: LABEL });
//       });
//     });
//   })
// );

//allow requests from any host
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST,PUT, DELETE");
  next();
});

//ROUTES

/**
 * Import all routes from route directory
 */
// app.use("/v1/auth", require("./routes/v1/auth"));
app.use("/v1/whiteBoard", require("./routes/v1/whiteBoard"));
app.use("/v1/checkInviteLink", require("./routes/v1/checkInviteLink"));
app.use("/v1/boardContent", require("./routes/v1/boardContent"));
app.use("/v1/historyContent", require("./routes/v1/contentHistory"));
app.use("/v1/chatHistory", require("./routes/v1/chatHistory"));
app.use("/v1/whiteboardUrl", require("./routes/v1/whiteboardUrl"));
app.use("/v1/Team", require("./routes/v1/Team"));
app.use("/v1/user", require("./routes/v1/user"));


app.use("/test", (req, res) => {
  return res.status(200).send("WhiteBoard API's are live");
});

//server static files
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

// START THE SERVER
server.listen(port, () => {
  console.log(LABEL + " is running on port " + port);
});




// const multer = require("multer");
//   const fs = require("fs");

//   var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}_${file.originalname}`)
//   },
 
// })
 
// var upload = multer({ storage: storage }).single("file")

// app.post("/api/chat/uploadfiles" ,(req, res) => {
//   upload(req, res, err => {
//     if(err) {
//       return res.json({ success: false, err })
//     }
//     return res.json({ success: true, url: res.req.file.path });
//   })
// });


//catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).send("Page/Api Not Found");
  return;
});

process.on("SIGINT", function () {
  process.exit(0);
});

process.on("SIGTERM", function () {
  process.exit(0);
});

module.exports = app;
