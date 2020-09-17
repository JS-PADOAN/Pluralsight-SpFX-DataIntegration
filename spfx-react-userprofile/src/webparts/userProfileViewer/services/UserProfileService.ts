import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";  
import { IUserProfile } from '../components/IUserProfile';
import { IDataService } from './IDataService'; 
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';  
import { PageContext } from '@microsoft/sp-page-context';  
 
export class UserProfileService implements IDataService {
    public static readonly serviceKey: ServiceKey<IDataService> = ServiceKey.create<IDataService>('userProfle:data-service', UserProfileService);  
    private _spHttpClient: SPHttpClient;
    private _pageContext: PageContext;  
    private _currentWebUrl: string;  

    constructor(serviceScope: ServiceScope) {  
        serviceScope.whenFinished(() => {  
            // Configure the required dependencies  
            this._spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
            this._pageContext = serviceScope.consume(PageContext.serviceKey);  
            this._currentWebUrl = this._pageContext.web.absoluteUrl;  
        });  
    }

    public getUserProfileProperties(): Promise<IUserProfile> {
        return new Promise<IUserProfile>((resolve: (itemId: IUserProfile) => void, reject: (error: any) => void): void => {  
            this.readUserProfile()  
              .then((orgChartItems: IUserProfile): void => {  
                resolve(this.processUserProfile(orgChartItems));  
              });  
          });
    }

    private readUserProfile(): Promise<IUserProfile> {  
        return new Promise<IUserProfile>((resolve: (itemId: IUserProfile) => void, reject: (error: any) => void): void => {  
          this._spHttpClient.get(`${this._currentWebUrl}/_api/SP.UserProfiles.PeopleManager/getmyproperties`,  
          SPHttpClient.configurations.v1,  
          {  
            headers: {  
              'Accept': 'application/json;odata=nometadata',  
              'odata-version': ''  
            }  
          })  
          .then((response: SPHttpClientResponse): Promise<{ value: IUserProfile }> => {  
            return response.json();  
          })  
          .then((response: { value: IUserProfile }): void => {  
            //resolve(response.value);  
            var output: any = JSON.stringify(response);  
            resolve(output); 
          }, (error: any): void => {  
            reject(error);  
          });  
        });      
    }  

    private processUserProfile(orgChartItems: any): any { 
        return JSON.parse(orgChartItems);  
    }
}