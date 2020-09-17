import * as React from 'react';
import styles from './UserProfileViewer.module.scss';
import { IUserProfileViewerProps } from './IUserProfileViewerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IDataService } from '../services/IDataService';
import { UserProfileService } from '../services/UserProfileService';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ServiceScope, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { IUserProfileViewerState } from './IUserProfileViewerState';
import { IUserProfile } from '../components/IUserProfile';

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

export default class UserProfileViewer extends React.Component<IUserProfileViewerProps, IUserProfileViewerState> {
  private dataCenterServiceInstance: IDataService;

  constructor(props: IUserProfileViewerProps, state: IUserProfileViewerState) {  
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
    this.dataCenterServiceInstance = serviceScope.consume(UserProfileService.serviceKey);

    this.dataCenterServiceInstance.getUserProfileProperties().then((userProfileItems: IUserProfile) => {  
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

  public render(): React.ReactElement<IUserProfileViewerProps> {
    return (
      <div className={ styles.userProfileViewer }>
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
