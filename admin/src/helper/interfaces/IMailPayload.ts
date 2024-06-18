export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PayloadType;
}

enum EmailTemplates {
  RESET_PASSWORD = 'reset-password',
  REGISTER = 'registration',
  EMAIL_VERIFICATION = 'email-verification',
  INVITE_INVESTOR = 'invite-investor',
  INVESTOR = 'investor',
}

interface PayloadType {
  emails: string[];
  subject: string;
  data: any;
}
