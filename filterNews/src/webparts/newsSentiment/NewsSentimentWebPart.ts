import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDynamicField,
  PropertyPaneDynamicFieldSet,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'NewsSentimentWebPartStrings';
import NewsSentiment from './components/NewsSentiment';
import { INewsSentimentProps } from './components/INewsSentimentProps';


import { DynamicProperty } from '@microsoft/sp-component-base';
import { IData } from '../../data/IData';


export interface INewsSentimentWebPartProps {
  description: string;
  keywords:DynamicProperty<IData>;
}

export default class NewsSentimentWebPart extends BaseClientSideWebPart<INewsSentimentWebPartProps> {

  public render(): void {
    const element: React.ReactElement<INewsSentimentProps> = React.createElement(
      NewsSentiment,
      {
        description: this.properties.description,
        keywords : this.properties.keywords
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
                PropertyPaneDynamicFieldSet({
                  label: 'Select event source',
                  fields: [
                    PropertyPaneDynamicField('keywords', {
                      label: 'Get keywords from'
                    })
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
