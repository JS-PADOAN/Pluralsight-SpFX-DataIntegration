import { IUserProfile } from '../components/IUserProfile';  
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';    
import { PageContext } from '@microsoft/sp-page-context';    
   
export class UserProfileService  {      
    private _spHttpClient: SPHttpClient;   
    private _currentWebUrl: string;    
  
    constructor(spHttpClient: SPHttpClient, currentWebUrl:string) {             
      this._spHttpClient = spHttpClient; 
      this._currentWebUrl = currentWebUrl;                 
    }  

    public async getMyUserProfile() : Promise<IUserProfile> {
      let u = await this.getCurrentUserProfile();

      for (let i: number = 0; i < u.UserProfileProperties.length; i++) {  
        if (u.UserProfileProperties[i].Key == "FirstName") {  
          u.FirstName = u.UserProfileProperties[i].Value;  
        }  
  
        if (u.UserProfileProperties[i].Key == "LastName") {  
          u.LastName = u.UserProfileProperties[i].Value;  
        }  
  
        if (u.UserProfileProperties[i].Key == "WorkPhone") {  
          u.WorkPhone = u.UserProfileProperties[i].Value;  
        }  
  
        if (u.UserProfileProperties[i].Key == "Department") {  
          u.Department = u.UserProfileProperties[i].Value;  
        }  
  
        if (u.UserProfileProperties[i].Key == "PictureURL") {  
          u.PictureURL = u.UserProfileProperties[i].Value;  
        }  
      }

      return u;
    }   
  
    private async getCurrentUserProfile(): Promise<IUserProfile> {    
        let response = await this._spHttpClient.get(`${this._currentWebUrl}/_api/SP.UserProfiles.PeopleManager/getmyproperties`,    
          SPHttpClient.configurations.v1,    
          {    
            headers: {    
              'Accept': 'application/json;odata=nometadata',    
              'odata-version': ''    
            }    
          })    
         
          return response.json();                      
    }    
  
    private processUserProfile(orgChartItems: any): any {   
        return JSON.parse(orgChartItems);    
    }  
}  