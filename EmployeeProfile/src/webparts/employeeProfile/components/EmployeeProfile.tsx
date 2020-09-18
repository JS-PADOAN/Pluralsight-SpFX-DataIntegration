import * as React from 'react';
import styles from './EmployeeProfile.module.scss';
import { IEmployeeProfileProps } from './IEmployeeProfileProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ServiceScope, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { IUserProfileService } from '../Services/IUserProfileService';
import { UserProfileService } from '../Services/UserProfileService';
import { IUserProfile } from './IUserProfile';
import { IUserProfileViewerState } from './IUserProfileViewerState';



export class UserProfile implements IUserProfile {
  FirstName: string;
  LastName: string;    
  Email: string;
  Title: string;
  WorkPhone: string;
  DisplayName: string;
  Department: string;
  PictureURL: string;    
  UserProfileProperties: Array<any>;
}


export default class EmployeeProfile extends React.Component<IEmployeeProfileProps, IUserProfileViewerState> {
  private userProfileServiceInstance: IUserProfileService;

  constructor(props: IEmployeeProfileProps, state: IUserProfileViewerState) {  
    super(props); 

    let userProfile: IUserProfile = new UserProfile();
    userProfile.FirstName = "";
    userProfile.LastName = "";
    userProfile.Email = "";
    userProfile.Title = "";
    userProfile.WorkPhone = "";
    userProfile.DisplayName = "";
    userProfile.Department = "";
    userProfile.PictureURL = "";
    userProfile.UserProfileProperties = [];

    this.state = {  
      userProfileItems: userProfile
    };     
  }

  public componentWillMount(): void {  
    let serviceScope: ServiceScope = this.props.serviceScope;    
    this.userProfileServiceInstance = serviceScope.consume(UserProfileService.serviceKey);  
  
    this.userProfileServiceInstance.getUserProfileProperties().then((userProfileItems: IUserProfile) => {    
      for (let i: number = 0; i < userProfileItems.UserProfileProperties.length; i++) {  
        if (userProfileItems.UserProfileProperties[i].Key == "FirstName") {  
          userProfileItems.FirstName = userProfileItems.UserProfileProperties[i].Value;  
        }  
  
        if (userProfileItems.UserProfileProperties[i].Key == "LastName") {  
          userProfileItems.LastName = userProfileItems.UserProfileProperties[i].Value;  
        }  
  
        if (userProfileItems.UserProfileProperties[i].Key == "WorkPhone") {  
          userProfileItems.WorkPhone = userProfileItems.UserProfileProperties[i].Value;  
        }  
  
        if (userProfileItems.UserProfileProperties[i].Key == "Department") {  
          userProfileItems.Department = userProfileItems.UserProfileProperties[i].Value;  
        }  
  
        if (userProfileItems.UserProfileProperties[i].Key == "PictureURL") {  
          userProfileItems.PictureURL = userProfileItems.UserProfileProperties[i].Value;  
        }  
      }  
  
      this.setState({ userProfileItems: userProfileItems });    
    });   
  }  
  
  
  public render(): React.ReactElement<IEmployeeProfileProps> {
    return (
      <div className={ styles.employeeProfile }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Fetch User Profile Properties</p>
              
              <img src={this.state.userProfileItems.PictureURL}></img>
              
              <p> 
                Name: {this.state.userProfileItems.LastName}, {this.state.userProfileItems.FirstName}
              </p>

              <p>
                WorkPhone: {this.state.userProfileItems.WorkPhone}
              </p>
              
              <p>
                Department: {this.state.userProfileItems.Department}
              </p>              

            </div>
          </div>
        </div>
      </div>
    );
  }
}
