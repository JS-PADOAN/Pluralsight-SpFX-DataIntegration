import * as React from 'react';
import styles from './EmployeeGraph.module.scss';
import { IEmployeeGraphProps } from './IEmployeeGraphProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IUserProfileState } from './IUserProfileState';

import { MSGraphClient } from '@microsoft/sp-http';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export default class EmployeeGraph extends React.Component<IEmployeeGraphProps, IUserProfileState> {



  constructor(props: IEmployeeGraphProps, state: IUserProfileState) {  
    super(props);    

    this.state = {  
      profile: null
    };        
  }

  public componentDidMount() : void{  
    this.props.context.msGraphClientFactory
      .getClient()
      .then((c: MSGraphClient): void => {
        // get information about the current user from the Microsoft Graph
        c.api('/me').get((error, user: MicrosoftGraph.User, rawResponse?: any) => {
          this.setState({ profile : user});          
        });
      });
  }

  public render(): React.ReactElement<IEmployeeGraphProps> {   
    return (
      <div className={ styles.employeeGraph }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>User Profile properties retrieved with GRAPH API ;-).</p>
              <p className={ styles.description }>DisplayName : {this.state.profile != null ? this.state.profile.displayName : ""}</p>
              <p className={ styles.description }> Email : { this.state.profile != null ? this.state.profile.mail : "" }</p>
              <p className={ styles.description }>Mobile Phone : { this.state.profile != null ? this.state.profile.mobilePhone : ""}</p>      
            </div>
          </div>
        </div>
      </div>
    );   
  }
}
