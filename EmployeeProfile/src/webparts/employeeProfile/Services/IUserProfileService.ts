import { IUserProfile } from '../components/IUserProfile';

export interface IUserProfileService {  
    getUserProfileProperties: () => Promise<IUserProfile>;  
}  