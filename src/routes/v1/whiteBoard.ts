import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { entryPoint } from "../../middlewares/entryPoint";
import { config } from "../../config/config";
import { exitPoint } from "../../middlewares/exitPoint";
import * as WhiteBoard from "../../controllers/whiteBoard";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as Minio from "minio";

const creds = {
  endPoint: "localhost",
  port: 9000,
  bucket: "test",
  accessKey: " KTBKH1T4XHVBJX2SRHDL",
  secretKey: "7XbdXgJCJtkma6G6zgf32qVJkV8dubP1fMXVAGg+",
};

var minioClient = new Minio.Client({
  endPoint: creds.endPoint,
  port: creds.port,
  useSSL: false,
  accessKey: creds.accessKey,
  secretKey: creds.secretKey,
});

//======multer logic======

/**
 * Uplaod image store in specific root directory(folder)
 */
const fileStorage = multer.diskStorage({
  // Destination to store image
  destination: function (req, file, callback) {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      fs.mkdirSync(config.imgPath, { recursive: true });
      callback(null, config.imgPath);
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "video/avi" ||
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/mpeg" ||
      file.mimetype === "audio/ogg" ||
      file.mimetype === "video/ogg" ||
      file.mimetype === "application/ogg" ||
      file.mimetype === "application/zip" ||
      file.mimetype === "application/vnd.rar" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      fs.mkdirSync(config.pdfPath, { recursive: true });
      callback(null, config.pdfPath);
    }
  },
  filename: (req, file, cb) => {
    console.log("type is::", req.body.type);
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileUpload = multer({
  storage: fileStorage,
  limits: {
    fileSize: config.size,
  },
  fileFilter(req, file, cb) {
    // console.log("file is ", file);
    if (
      !file.originalname.match(
        /\.(png|jpg|pdf|doc|docx|csv|xls|xlsx|avi|mp4|mpeg|oga|ogv|ogx|rar|zip|txt|ogg|ppt|pptx)$/
      )
    ) {
      // upload only png and jpg and pdf format
      return cb(new Error("Please upload a file"));
    }

    cb(undefined, true);
  },
});

//========== multer logic ends ========

//=========== minio logic ===============
/**
 * Uplaod image store in specific root directory(folder) in bucket
 */
export function uploadToMinio(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const fileName =
    req.file.fieldname + "_" + Date.now() + path.extname(req.file.originalname);
  console.log("field name", fileName);
  minioClient.putObject(
    creds.bucket,
    fileName,
    req.file.buffer,
    function (error, etag) {
      console.log("inside minio function", etag);
      if (error) {
        req.apiStatus = {
          isSuccess: false,
          error: "Upload error: Minio",
          data: error,
        };
        next();
        return;
      }
      // console.log("file", etag);
      // const url = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`
      const url = `http://${creds.endPoint}:${creds.port}/${creds.bucket}/${fileName}`;
      console.log("minio url", url);
      req.file.path = url;
      next();
    }
  );
}

/**
 * User send post  request for upload image in whiteboard using /upload route
 */
router.post(
  "/upload/:whiteboardId",
  entryPoint,
  multer({ storage: multer.memoryStorage() }).single("upload"),
  uploadToMinio,
  WhiteBoard.updateBoardImage,
  exitPoint
);

router.get("/uploadedImages", function (request: any, response: any) {
  console.log("payload", request.body);

  minioClient.listObjects("test", "", false, function (error, etag) {
    if (error) {
      return console.log(error);
    }
    console.log("file", etag);

    response.send(etag);
  });
});

// //========= minio logic ends =====
/**
 * User send get request for get all whiteboard using /all route
 */

router.get("/all", entryPoint, WhiteBoard.getAllWhiteboard, exitPoint);

/**
 * User send get request for get single whiteboard using /whiteboardId route
 */
router.get("/:whiteboardId", entryPoint, WhiteBoard.getWhiteBoard, exitPoint);

/**
 * User send post request for add whiteboard using /add route
 */
router.post("/add", entryPoint, WhiteBoard.addWhiteboard, exitPoint);
/**
 * User send put request for update whiteboard using /update route
 */
router.put(
  "/update/:whiteboardId",
  entryPoint,
  WhiteBoard.updateWhiteBoard,
  exitPoint
);

/**
 * User send put request for update  whiteboard image using /updateImage route
 */
router.put(
  "/updateImage/:whiteboardId",
  entryPoint,
  fileUpload.single("file"),
  WhiteBoard.updateBoardImage,
  exitPoint
);

/**
 * User send delete request for delete whiteboard using /remove route
 */
router.delete(
  "/remove/:whiteboardId",
  entryPoint,
  WhiteBoard.removeWhiteboard,
  exitPoint
);

module.exports = router;
