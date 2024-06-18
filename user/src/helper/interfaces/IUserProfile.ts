import { IProfileQnA } from './IProfileQnA';

export interface IUserProfile {
  profile_type: string;
  question_answer: IProfileQnA[];
}
