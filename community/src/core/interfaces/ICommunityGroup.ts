import { GROUP_TYPE, GROUP_PRIVACY } from '../constant/enum.constant';

export interface ICommunityGroup {
  group_name: string;
  description: string;
  group_type: GROUP_TYPE;
  privacy: GROUP_PRIVACY;
  cover_page: string;
  created_by: number;
}
