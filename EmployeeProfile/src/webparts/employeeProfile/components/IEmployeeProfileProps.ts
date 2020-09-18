import { ServiceScope } from '@microsoft/sp-core-library';  

export interface IEmployeeProfileProps {
  description: string;
  serviceScope: ServiceScope; 
}
