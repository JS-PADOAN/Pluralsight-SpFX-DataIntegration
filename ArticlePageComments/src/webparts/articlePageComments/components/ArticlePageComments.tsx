import * as React from 'react';
import styles from './ArticlePageComments.module.scss';
import { IArticlePageCommentsProps } from './IArticlePageCommentsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IArticlePageCommentsState } from './IArticlePageCommentsState';


import IPageComment from "./IPageComment";
import {
  SPHttpClient,
  HttpClient,
  SPHttpClientResponse,
  IHttpClientOptions,
  HttpClientResponse
} from "@microsoft/sp-http";

export default class ArticlePageComments extends React.Component<IArticlePageCommentsProps,IArticlePageCommentsState> {
  
  private _baseUrl: string;
  private _listId: string;
  private _listItemId: string;
  private _spHttpClient: SPHttpClient;

  constructor(props: IArticlePageCommentsProps, state: IArticlePageCommentsState) {  
    super(props);    

    let c = props.context;

    this._baseUrl = c.pageContext.web.absoluteUrl;
    this._listId =
      c.pageContext.list &&
      c.pageContext.list.id.toString();
    this._listItemId =
     c.pageContext.listItem &&
     c.pageContext.listItem.id.toString();
    this._spHttpClient = c.spHttpClient; 

    this.state = {  
      comments: []
    };     
  }    

  public componentDidMount(): void {  
    this._getTop5PageComments().then (c=> {
          this.setState({ comments: c });
        }
      );
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
  
  public render(): React.ReactElement<IArticlePageCommentsProps> {
  
    let items = this.state.comments.map((item) => <li>{item.comment}</li>);   
    
    return (
      <div className={ styles.articlePageComments }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Here are the {this.state.comments.length} comment(s)</span>
              <ul>
                {items}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
