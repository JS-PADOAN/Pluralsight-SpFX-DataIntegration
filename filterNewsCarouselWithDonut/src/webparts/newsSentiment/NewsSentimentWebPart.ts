import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneDynamicField,
  PropertyPaneDynamicFieldSet,
  PropertyPaneTextField,
  PropertyPaneCheckbox
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'NewsSentimentWebPartStrings';
import NewsSentiment from './components/NewsSentiment';
import { INewsSentimentProps } from './components/INewsSentimentProps';

export default class NewsSentimentWebPart extends BaseClientSideWebPart<INewsSentimentProps> {

  public render(): void {
    const element: React.ReactElement<INewsSentimentProps> = React.createElement(
      NewsSentiment,
      {
        description: this.properties.description,
        keywords : this.properties.keywords,
        textSentimentApiKey : this.properties.textSentimentApiKey,    
        bingKey : this.properties.bingKey,    
        context : this.context,
        chosenSentiment: this.properties.chosenSentiment,
        displaydonut : this.properties.displaydonut
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
                }),
                PropertyPaneTextField('textSentimentApiKey', {
                  label: "Sentiment Api Key"
                }),
                PropertyPaneTextField('bingKey', {
                  label: "Bing Api Key"
                }),
                PropertyPaneDropdown('chosenSentiment', {
                  label: "Chosen sentiment",
                  options: [
                    { key: 'positive', text: 'Positive'},
                    { key: 'neutral', text: 'Neutral' },
                    { key: 'negative', text: 'Negative' }                    
                  ]
                }),
                PropertyPaneCheckbox('displaydonut', { text : "display donut chart ?"})
              ]
            }
          ]
        }
      ]
    };
  }
}
