import { TRUE_FALSE } from '../constant';

export interface IWorkExperience {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  currently_working: TRUE_FALSE;
  description: string;
}
