import * as React from 'react';
import styles from './EmployeeProfile.module.scss';
import { IEmployeeProfileProps } from './IEmployeeProfileProps';
import { UserProfileService } from '../Services/UserProfileService';
import { IUserProfileViewerState } from './IUserProfileViewerState';

export default class EmployeeProfile extends React.Component<IEmployeeProfileProps, IUserProfileViewerState> {
  private service: UserProfileService;

  constructor(props: IEmployeeProfileProps, state: IUserProfileViewerState) {  
    super(props);  
    
    this.service = new UserProfileService(
      props.context.spHttpClient,
      props.context.pageContext.web.absoluteUrl
      ); 
  }  
  
  public componentDidMount(): void {  

    this.service.getMyUserProfile().then (u=> {
         this.setState({ profile: u });                    
        }
      );
  }

  public render(): React.ReactElement<IEmployeeProfileProps> {
    if(this.state)
    {
      return (
        <div className={ styles.employeeProfile }>
          <div className={ styles.container }>
            <div className={ styles.row }>
              <div className={ styles.column }>
                <span className={ styles.title }>Welcome to SharePoint!</span>
                <p className={ styles.subTitle }>Fetch User Profile Properties</p>              
                <img src={this.state.profile.PictureURL}></img>              
                <p> 
                  Name: {this.state.profile.LastName}, {this.state.profile.FirstName}
                </p>
                <p>
                  WorkPhone: {this.state.profile.WorkPhone}
                </p>              
                <p>
                  Department: {this.state.profile.Department}
                </p>              
              </div>
            </div>
          </div>
        </div>
      );
    }
    else
    {
      return (
        <div className={ styles.employeeProfile }>
          <span>Retrieving data...</span>
        </div>
      );
    }
  }
}
