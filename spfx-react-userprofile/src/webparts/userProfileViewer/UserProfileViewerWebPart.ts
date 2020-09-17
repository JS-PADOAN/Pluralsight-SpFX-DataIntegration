import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'UserProfileViewerWebPartStrings';
import UserProfileViewer from './components/UserProfileViewer';
import { IUserProfileViewerProps } from './components/IUserProfileViewerProps';

export interface IUserProfileViewerWebPartProps {
  description: string;
}

export default class UserProfileViewerWebPart extends BaseClientSideWebPart<IUserProfileViewerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IUserProfileViewerProps > = React.createElement(
      UserProfileViewer,
      {
        description: this.properties.description,
        userName: encodeURIComponent('i:0#.f|membership|' + this.context.pageContext.user.loginName),
        serviceScope: this.context.serviceScope
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
