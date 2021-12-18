export interface MailProvider {
  sendMail(mailModel: MailModel, cb: Function): any;
}

export enum MessageType {
  TEMPLATE_TYPE = "TEMPLATE_TYPE",
  HTML_TYPE = "HTML_TYPE",
  TEXT_TYPE = "TEXT_TYPE",
}

export enum TemplateType {
  NO_TEMPLATE = "NO_TEMPLATE",
  BASIC = "BASIC",
  TRANSACTIONAL = "TRANSACTIONAL",
  PROMOTIONAL = "PROMOTIONAL",
  WELCOME_MAIL = "WELCOME_MAIL",
}

export enum ContentType {
  PLAIN_TEXT = "text/plain",
  JSON_TEXT = "json",
  HTML_TEXT = "html",
}

export class MailModel {
  sendGridAPIKey: string;
  fromMail: string;
  fromName: string;
  to: any;
  templateType: TemplateType = TemplateType.BASIC;
  subject: string;
  messageType: MessageType;
  body: string | any;
  contentType: ContentType = ContentType.PLAIN_TEXT;
  templateId: string | any;
  templateData: any;

  constructor(
    sendGridAPIKey: string,
    fromMail: string,
    fromName: string,
    to: any,
    subject: string,
    messageType: MessageType
  ) {
    this.sendGridAPIKey = sendGridAPIKey;
    this.fromMail = fromMail;
    this.fromName = fromName;
    this.to = to;
    this.subject = subject;
    this.messageType = messageType;
  }
  setTemplateType(templateType: TemplateType) {
    this.templateType = templateType;
  }
  setContentType(contentType: ContentType) {
    this.contentType = contentType;
  }
  setBody(body: any) {
    this.body = body;
  }
  setTemplateId(templateId: string) {
    this.templateId = templateId;
  }
  setTemplateData(templateData: any) {
    this.templateData = templateData;
  }
}
