export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PayloadType;
}

enum EmailTemplates {
  RESET_PASSWORD = 'reset-password',
  REGISTER = 'registration',
  EMAIL_VERIFICATION = 'email-verification',
  WELCOME_INVESTOR = 'welcome-investor',
}

interface PayloadType {
  emails: string[];
  subject: string;
  data: any;
}
