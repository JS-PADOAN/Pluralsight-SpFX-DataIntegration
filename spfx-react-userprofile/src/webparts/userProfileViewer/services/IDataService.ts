import { IUserProfile } from '../components/IUserProfile';

export interface IDataService {  
    getUserProfileProperties: () => Promise<IUserProfile>;  
}  