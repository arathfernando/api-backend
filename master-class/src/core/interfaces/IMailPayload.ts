export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PayloadType;
}

enum EmailTemplates {
  MASTERCLASS_JOIN_REQUEST = 'masterclass-join-request',
  MASTERCLASS_INVITE_STUDENT = 'masterclass-invite-student',
  MASTERCLASS_INVITE = 'masterclass-invite',
}

interface PayloadType {
  emails: string[];
  subject: string;
  data: any;
}
