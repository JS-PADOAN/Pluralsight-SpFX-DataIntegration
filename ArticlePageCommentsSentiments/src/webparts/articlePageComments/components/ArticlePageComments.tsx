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
  
  private _cognitiveServicesTextUrl: string = "https://js-textanalytics.cognitiveservices.azure.com/text/analytics/v3.0/";

  constructor(props: IArticlePageCommentsProps, state: IArticlePageCommentsState) {  
    super(props);    

    this.state = {  
      comments: []
    };     
  }
  private _baseUrl: string;
  private _listId: string;
  private _listItemId: string;
  private _spHttpClient: SPHttpClient;

  private _ApihttpClient: HttpClient;
  
  public componentWillMount(): void {

  let c = this.props.context;

    this._baseUrl = c.pageContext.web.absoluteUrl;
    this._listId =
      c.pageContext.list &&
      c.pageContext.list.id.toString();
    this._listItemId =
     c.pageContext.listItem &&
     c.pageContext.listItem.id.toString();
    this._spHttpClient = c.spHttpClient; 

    this._ApihttpClient = c.httpClient;
  }




  public componentDidMount(): void {  

    this._getTop5PageComments().then (c=> {

        async function asyncForEach(array, callback) {
          for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
          }
          return array;
        }

          asyncForEach(c, async element => {
              const res = await this._getSentimentFromComment(element);
              element.Sentiment = res.Sentiment;
              element.confidence = res.Confidence;
              element.language = res.language;
          }).then ( c2 => { this.setState({ comments: c2 }); });                    
        }
      );
  }

  private async _getTop5PageComments(): Promise<IPageComment[]> {

    // const FakeSentences = [{ id:1, Sentence:"Woh, it's amazing"}
    //  ,{id:2, Sentence : "Good content, but page very very slow..."}
    //  ,{id:3, Sentence : "Bravo, beau travail"}
    //  ,{id:4, Sentence : "El texto de muestra se enviará a la API de análisis de texto."}     
    // ];

    // const Fakecomments: IPageComment[] = FakeSentences.map(c => {
    //   const comment: IPageComment = {
    //     id: c.id,
    //     author: "JS",
    //     comment: c.Sentence,
    //     language : "unknown",
    //     Sentiment : "undefined",
    //     confidence : 1
    //   };
    //   return comment;
    // });

    // return Fakecomments;

    const pageCommentsEndpoint: string = `${this._baseUrl}/_api/web/lists('${this._listId}')/GetItemById(${this._listItemId})/Comments?$top=5&$inlineCount=AllPages`;

    const response: SPHttpClientResponse = await this._spHttpClient.get(pageCommentsEndpoint, SPHttpClient.configurations.v1);
    const responseJson: any = await response.json();
    const comments: IPageComment[] = responseJson.value.map(c => {
      const comment: IPageComment = {
        id: c.id,
        author: c.author.name,
        comment: c.text,
        language : "unknown",
        Sentiment : "undefined",
        confidence : 1
      };
      return comment;
    });

    return comments;
  }



  private async _getSentimentFromComment(comment: IPageComment): Promise<any> {
    const detectedLanguage: string = await this._detectLanguage(comment);
    const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForApi(comment,detectedLanguage);

    const cognitiveResponse: HttpClientResponse = await this._ApihttpClient.post(
      `${this._cognitiveServicesTextUrl}sentiment`,
      HttpClient.configurations.v1,
      httpOptions
    );
    const cognitiveResponseJSON: any = await cognitiveResponse.json();

    if (cognitiveResponseJSON.documents.length === 1) {
      const doc = cognitiveResponseJSON.documents[0];
      const sentiment = doc.sentiment;
      console.log("sentiment for id "+ comment.id+" : "+ sentiment);

      switch(sentiment)
      {
        case "positive" :  return { Sentiment : sentiment, Confidence : doc.confidenceScores.positive, language : detectedLanguage };
        case "neutral" : return { Sentiment : sentiment, Confidence : doc.confidenceScores.neutral, language : detectedLanguage };
        case "negative" : return { Sentiment : sentiment, Confidence : doc.confidenceScores.negative, language : detectedLanguage };
      }            
    }

    return { Sentiment : "undefined", Confidence : 1, language : "unknown" };
  }

  private async _detectLanguage(comment: IPageComment): Promise<string> {
    const httpOptions: IHttpClientOptions = this._prepareHttpOptionsForApi(comment, null);
    const cognitiveResponse: HttpClientResponse = await this._ApihttpClient.post(
      `${this._cognitiveServicesTextUrl}languages`,
      HttpClient.configurations.v1,
      httpOptions
    );
    const cognitiveResponseJSON: any = await cognitiveResponse.json();  
  
    console.log("detected language : "+ cognitiveResponseJSON.documents[0].detectedLanguage.iso6391Name);
    return cognitiveResponseJSON.documents[0].detectedLanguage.iso6391Name;
  }

  private _prepareHeadersForTextApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Cache-Control", "no-cache");
    requestHeaders.append("Ocp-Apim-Subscription-Key", this.props.textSentimentApiKey);

    return requestHeaders;
  }

  private _prepareHttpOptionsForApi( comment: IPageComment, language: string): IHttpClientOptions {
    const body: any = {
      documents: [{
        id: comment.id,
        text: comment.comment
      }]
    };

    if (language) {
      body.language = language;
    }    
    
    const httpOptions: IHttpClientOptions = {
      body: JSON.stringify(body),
      headers: this._prepareHeadersForTextApi()
    };

    return httpOptions;
  }

  
  public render(): React.ReactElement<IArticlePageCommentsProps> {
  
    let items = this.state.comments
      .filter((item) => item.Sentiment == this.props.chosenSentiment)
      .map((item) => <li>{item.comment}, ({item.language}) Sentiment : {item.Sentiment} ({item.confidence})</li>);   
    
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
