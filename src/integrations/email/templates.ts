import { MessageType, TemplateType, MailModel } from "./mailModel";
import { sendMail } from "./index";
export function prepareEmailTemplate(templateId: string, templateData: any) {
  const enabledList: any = {
    "WHITEBOARD-101": true, //Invite Link Mail
  };

  const emailTemplates: any = {
    //Welcome mail
    "WHITEBOARD-101":
      "<!DOCTYPE html>" +
      '<html lang="en">' +
      "  <head>" +
      '    <meta charset="UTF-8" />' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
      "    <title>Whiteboard</title>" +
      "  </head>" +
      "" +
      "  <body" +
      '    style="' +
      "      margin: 0;" +
      "      padding: 0;" +
      "      background-color: #f6f9fc;" +
      "      font-family: Helvetica;" +
      '    "' +
      "  >" +
      "    <center" +
      '      class="outer_one"' +
      '      style="' +
      "        width: 100%;" +
      "        table-layout: fixed;" +
      "        background-color: #f6f9fc;" +
      "        padding-bottom: 40px;" +
      "        margin-top: 60px;" +
      '      "' +
      "    >" +
      "      <div" +
      '        class="outer_two"' +
      '        style="max-width: 600px; background-color: #10163a"' +
      "      >" +
      "        <table" +
      '          class="outer"' +
      '          style="' +
      "            margin: 0 auto;" +
      "            width: 100%;" +
      "            max-width: 600px;" +
      "            border-spacing: 0;" +
      "            font-family: sans-serif;" +
      "            color: #ffffff;" +
      "            box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25)," +
      "              0 10px 10px rgba(0, 0, 0, 0.22);" +
      '          "' +
      '          width="100%"' +
      "        >" +
      "          <tr>" +
      '            <td style="padding: 0">' +
      '              <table width="100%" style="border-spacing: 0">' +
      "                <tr>" +
      "                  <td" +
      '                    style="' +
      "                      padding: 5px;" +
      "                      text-align: left;" +
      "                      vertical-align: middle;" +
      '                    "' +
      '                    align="left"' +
      '                    valign="center"' +
      "                  >" +
      '<div style="color: #f4d836;font-weight: 600;font-size: 1.57rem;">WHITEBOARD</div>' +
      "                  </td>" +
      "                </tr>" +
      "              </table>" +
      "            </td>" +
      "          </tr>" +
      "          <tr>" +
      '            <td style="padding: 20px; padding-bottom: 10px; color: #ffffff">' +
      '              <p style="color: #f4d836; font-weight: bold; font-size: 18px">' +
      "                Welcome, in curriki whiteboard" +
      "              </p>" +
      "              <p" +
      '                style="' +
      "                  line-height: 20px;" +
      "                  font-weight: 520;" +
      "                  font-size: 16px;" +
      "                  letter-spacing: 0.5px;" +
      "				  color: #ffffff;" +
      '                "' +
      "              >" +
      "                We're very excited to have you on board!" +
      "              </p>" +
      "              <p" +
      '                style="' +
      "                  line-height: 20px;" +
      "                  font-weight: 520;" +
      "                  font-size: 16px;" +
      "                  letter-spacing: 0.5px;" +
      '                "' +
      "              >" +
      "                Please join us to the given  whiteboard link ." +
      "              </p>" +
      '            <a href="<replace_me_inviteLinks>" style="font-size: small;color: #388cda;">Click here to join whiteboard</a>' +
      "              <p" +
      '                style="' +
      "                  line-height: 20px;" +
      "                  font-weight: bold;" +
      "                  margin-top: 50px;" +
      "                  font-size: 16px;" +
      "                  color: #f4d836;" +
      "                  font-size: 17px;" +
      '                "' +
      "              >" +
      "                Best Regards," +
      "              </p>" +
      '              <p style="font-weight: 520; font-size: 16px;color: #f4d836">Whiteboard</p>' +
      "            </td>" +
      "          </tr>" +
      "" +
      "       " +
      "          <tr>" +
      '            <td style="padding: 0; background-color: #efefef" bgcolor="#efefef">' +
      '              <table width="100%" style="border-spacing: 0">' +
      "                " +
      "                <tr>" +
      "                  <td" +
      '                    style="' +
      "                      padding: 0;" +
      "                      padding-bottom: 20px;" +
      "                      text-align: center;" +
      "                      color: #898f9c;" +
      "                      background: linear-gradient(" +
      "118deg" +
      ",#f4d836,rgba(244,216,54,.7))" +
      '                    "' +
      '                    align="center"' +
      "                  >" +
      '                    <p style="font-size: 13px;">' +
      "                      Copyright © 2021 Whiteboard - All Rights Reserved" +
      "                    </p>" +
      "                  </td>" +
      "                </tr>" +
      "              </table>" +
      "            </td>" +
      "          </tr>" +
      "        </table>" +
      "      </div>" +
      "    </center>" +
      "  </body>" +
      "</html>",
  };

  try {
    var template: string = emailTemplates[templateId];
    if (!template) {
      console.log("email template not found");
      return undefined;
    }
    if (!enabledList[templateId]) {
      console.log("email template disabled");
      return undefined;
    }

    switch (templateId) {
      case "WHITEBOARD-101": {
        template = template.replace(
          "<replace_me_inviteLinks>",
          templateData.inviteLinks
        );
        return template;
      }
      default: {
        return undefined;
      }
    }
  } catch (err) {
    console.log("error preparing Email Template : " + err);
    return undefined;
  }
}
