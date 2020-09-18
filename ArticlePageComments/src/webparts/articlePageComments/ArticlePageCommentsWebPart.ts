import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ArticlePageCommentsWebPartStrings';
import ArticlePageComments from './components/ArticlePageComments';
import { IArticlePageCommentsProps } from './components/IArticlePageCommentsProps';

import IPageComment from "./components/IPageComment";
import {
  SPHttpClient,
  HttpClient,
  SPHttpClientResponse,
  IHttpClientOptions,
  HttpClientResponse
} from "@microsoft/sp-http";

export interface IArticlePageCommentsWebPartProps {
  description: string;
}

export default class ArticlePageCommentsWebPart extends BaseClientSideWebPart<IArticlePageCommentsWebPartProps> {

  private _baseUrl: string;
  private _listId: string;
  private _listItemId: string;
  private _spHttpClient: SPHttpClient;
  private _httpClient: HttpClient;

  public componentWillMount(): void {
    this._baseUrl = this.context.pageContext.web.absoluteUrl;
    this._listId =
      this.context.pageContext.list &&
      this.context.pageContext.list.id.toString();
    this._listItemId =
      this.context.pageContext.listItem &&
      this.context.pageContext.listItem.id.toString();
    this._spHttpClient = this.context.spHttpClient;
    this._httpClient = this.context.httpClient;

    let comments: IPageComment[] = await this._getTop5PageComments();

  }

  public render(): void {
    const element: React.ReactElement<IArticlePageCommentsProps> = React.createElement(
      ArticlePageComments,
      {
        description: this.properties.description, 
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private async _getTop5PageComments(): Promise<IPageComment[]> {
    const pageCommentsEndpoint: string = `${this._baseUrl}/_api/web/lists('${this._listId}')/GetItemById(${this._listItemId})/Comments?$top=5&$inlineCount=AllPages`;

    const response: SPHttpClientResponse = await this._spHttpClient.get(pageCommentsEndpoint, SPHttpClient.configurations.v1);
    const responseJson: any = await response.json();
    const comments: IPageComment[] = responseJson.value.map(c => {
      const comment: IPageComment = {
        id: c.id,
        author: c.author.name,
        comment: c.text
      };
      return comment;
    });

    return comments;
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
