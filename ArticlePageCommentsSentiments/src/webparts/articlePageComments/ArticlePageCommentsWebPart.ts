import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ArticlePageCommentsWebPartStrings';
import ArticlePageComments from './components/ArticlePageComments';
import { IArticlePageCommentsProps } from './components/IArticlePageCommentsProps';


export default class ArticlePageCommentsWebPart extends BaseClientSideWebPart<IArticlePageCommentsProps> {

  public render(): void {
    const element: React.ReactElement<IArticlePageCommentsProps> = React.createElement(
      ArticlePageComments,
      {
        chosenSentiment: this.properties.chosenSentiment,
        textSentimentApiKey : this.properties.textSentimentApiKey,
        description: this.properties.description, 
        context : this.context
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
                }),
                PropertyPaneTextField('textSentimentApiKey', {
                  label: strings.TextSentimentApiFieldLabel
                }),
                PropertyPaneDropdown('chosenSentiment', {
                  label: strings.ChosenSentimentFieldLabel,
                  options: [
                    { key: 'positive', text: 'Positive'},
                    { key: 'neutral', text: 'Neutral' },
                    { key: 'negative', text: 'Negative' }                    
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
