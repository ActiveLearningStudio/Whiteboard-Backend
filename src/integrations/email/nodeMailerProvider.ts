import {
  MailProvider,
  MessageType,
  TemplateType,
  ContentType,
  MailModel,
} from "./mailModel";
import nodemailer from "nodemailer";
import { prepareEmailTemplate } from "./templates";
import { config } from "../../config/config";

/**sendgrid mail provider type emails */
export class NodeMailerProvider implements MailProvider {
  sendMail(mailModel: MailModel, cb: Function) {
    var transporter = nodemailer.createTransport({
      host: config.mailtrapSMTPHost,
      port: 2525,
      // secure: true, // use SSL
      auth: {
        user: config.mailtrapAuthUser,
        pass: config.mailtrapAuthUser,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    prepareEmailData(mailModel, function (message: any) {
      console.log("message from prepareEmailData ", message);
      transporter.sendMail(message, function (error: any, info: any) {
        if (error) {
          console.log("Email sending error(nodemailer) - " + error);
          if (cb) {
            cb(error, null);
          }
        } else {
          //console.log('Email sent - ' + info.response);
          cb(null, info);
        }
      });
    });
  }
}

/** message preparation */
var prepareEmailData = function (mailModel: MailModel, cb: Function) {
  var msgData = {};
  if (mailModel.messageType == MessageType.HTML_TYPE) {
    var htmlData = prepareEmailTemplate(
      mailModel.templateId,
      mailModel.templateData
    );
    if (!htmlData) console.log("Email Template Not Found or Disabled");
    else {
      // const to = mailModel.to[0] ? mailModel.to[0].email : "";
      msgData = {
        from: mailModel.fromName + " <" + config.senderEmailId + ">",
        to: mailModel.to,
        subject: mailModel.subject,
        html: htmlData,
      };
    }
  }
  cb(msgData);
};
