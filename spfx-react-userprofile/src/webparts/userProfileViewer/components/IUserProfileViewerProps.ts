import { ServiceScope } from '@microsoft/sp-core-library';

export interface IUserProfileViewerProps {
  description: string;
  userName: string;
  serviceScope: ServiceScope;
}
