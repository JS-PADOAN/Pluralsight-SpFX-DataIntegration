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
import { SentimentService } from './Service/SentimentService';

export default class ArticlePageComments extends React.Component<IArticlePageCommentsProps,IArticlePageCommentsState> {
  
  //Service declaration
  private service:SentimentService;

  constructor(props: IArticlePageCommentsProps, state: IArticlePageCommentsState) {  
    super(props);    

    let c = props.context;

  //Service instanciation
    this.service = new SentimentService(
      c.pageContext.web.absoluteUrl,
      c.pageContext.list && c.pageContext.list.id.toString(),
      c.pageContext.listItem && c.pageContext.listItem.id.toString(),
      c.spHttpClient,
      c.httpClient, this.props.textSentimentApiKey
    );

    this.state = {  
      comments: []
    };     
  }    

  public componentDidMount(): void {  

    this.service.getCommentsAndCalculateSentiments().then (c=> {
         this.setState({ comments: c });                    
        }
      );
  }
  
  public render(): React.ReactElement<IArticlePageCommentsProps> {
  
let validItems = this.state.comments
.filter((item) => item.Sentiment == this.props.chosenSentiment);

    let items = validItems
      .map((item) => <li>{item.comment}, ({item.language}) Sentiment : {item.Sentiment} ({item.confidence})</li>);   
    
    return (
      <div className={ styles.articlePageComments }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Here are the {validItems.length} comment(s) that are {this.props.chosenSentiment}</span>
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
