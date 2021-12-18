import * as logger from "../../models/logs";
import { MailModel } from "./mailModel";
import { NodeMailerProvider } from "./nodeMailerProvider";


/**
 * Send a link through mail to user 
 */
//common implementaion of mail function
export async function sendMail(
  mailProvider: string,
  mailModel: MailModel,
  cb: Function
) {
  switch (mailProvider) {
    case "nodemailer": {
      new NodeMailerProvider().sendMail(
        mailModel,
        function (err: Error, result: any) {
          console.log("mail sent through nodemailer line72(switch case)");
          cb(err, result);
        }
      );
      break;
    }
    default: {
      logger.warn(logger.LogModule.CONTENT, null, "no mail config");
    }
  }
}
