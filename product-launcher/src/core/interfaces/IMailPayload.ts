export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PayloadType;
}

enum EmailTemplates {
  INVITE_EXPERT = 'invite-expert',
  PROJECT_INVESTOR_INVITE = 'project-investor-invite',
}

interface PayloadType {
  emails: string[];
  subject: string;
  data: any;
}
