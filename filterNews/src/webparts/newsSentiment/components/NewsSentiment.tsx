import * as React from 'react';
import styles from './NewsSentiment.module.scss';
import { INewsSentimentProps } from './INewsSentimentProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { INewsSentimentState } from './INewsSentimentState';
import { IData } from '../../../data/IData';

import { 
  HttpClient,  
  IHttpClientOptions,
  HttpClientResponse
} from "@microsoft/sp-http";
import INews from './INews';

export default class NewsSentiment extends React.Component<INewsSentimentProps, INewsSentimentState> {

  private _cognitiveServicesTextUrl: string = "https://js-textanalytics.cognitiveservices.azure.com/text/analytics/v3.0/";
  private _bingSearchUrl: string = "https://js-bingsearch.cognitiveservices.azure.com/bing/v7.0/news";
  
  private _ApihttpClient: HttpClient;

  constructor(props) {
    super(props);
    this.state = {
      currentkeywords : undefined,
      news : []
    }
  }

  public componentWillMount(): void {
      this._ApihttpClient = this.props.context.httpClient;
    }

  public async componentDidMount() {        
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data && data.keywords != undefined)
      {
        this.LoadNews(data);
      }
  }



  public async componentDidUpdate?(prevProps: INewsSentimentProps, prevState: INewsSentimentState, snapshot: any): Promise<void> {
    
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data && prevState.currentkeywords != data)
    {        
      this.LoadNews(data);
    }
  }

  private LoadNews(data : IData): void {
    this._getNewsFromBing(data).then (c=> {

      async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
        return array;
      }

        asyncForEach(c, async element => {
            await this._getSentiment(element);           
        }).then ( c2 => { 
          this.setState({ currentkeywords:data,  news: c2 }); 
        });                    
      }
    );
  }


  private async _getNewsFromBing(data : IData): Promise<INews[]> {    

    const response: HttpClientResponse = await this._ApihttpClient.get(
      `${this._bingSearchUrl}?category=${data}&mkt=en-US`,
      HttpClient.configurations.v1,
      {       
        headers: this._prepareHeadersForBingApi()
      }
    );
    var i = 0;
    const responseJson: any = await response.json();
    const comments: INews[] = responseJson.value.map(c => {
      const comment: INews = {
        id: i++,
        name : c.name,
        url : c.url,
        thumbnail : c.image.thumbnail.contentUrl,
        description : c.description,               
        language : data.language,
        Sentiment : "undefined",
        confidence : 1
      };     
      return comment;
    });

    return comments;

  }


  private _prepareHeadersForSentimentApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Cache-Control", "no-cache");
    requestHeaders.append("Ocp-Apim-Subscription-Key", this.props.textSentimentApiKey);

    return requestHeaders;
  }

  private _prepareHeadersForBingApi(): Headers {
    const requestHeaders: Headers = new Headers();
    requestHeaders.append("Accept", "application/json");
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Ocp-Apim-Subscription-Key", this.props.bingKey);

    return requestHeaders;
  }

  private async _getSentiment(currentnews: INews): Promise<void> {   

    const body: any = {
      documents: [{
        id: currentnews.id,
        text: currentnews.description
      }]
    };   
    body.language = currentnews.language;


    const cognitiveResponse: HttpClientResponse = await this._ApihttpClient.post(
      `${this._cognitiveServicesTextUrl}sentiment`,
      HttpClient.configurations.v1,
      {       
        body: JSON.stringify(body),
        headers: this._prepareHeadersForSentimentApi()
      }
    );
    const cognitiveResponseJSON: any = await cognitiveResponse.json();

    if (cognitiveResponseJSON.documents.length === 1) {
      const doc = cognitiveResponseJSON.documents[0];
      const sentiment = doc.sentiment;
      console.log("sentiment for id "+ currentnews.id+" : "+ sentiment);
      
      currentnews.Sentiment = sentiment;

      switch(sentiment)
      {
        case "positive" : { currentnews.confidence = doc.confidenceScores.positive; };
        case "neutral" : { currentnews.confidence = doc.confidenceScores.positive; };
        case "negative" : { currentnews.confidence = doc.confidenceScores.positive; };
      }  
      
      return;
    }

    currentnews.Sentiment = "undefined";
    currentnews.confidence = 1;

    return;
  }

  public render(): React.ReactElement<INewsSentimentProps> {

 
    let validItems = this.state.news
    .filter((item) => item.Sentiment == this.props.chosenSentiment);
    
        let items = validItems
          .map((item) => <li>{item.name}, Sentiment : {item.Sentiment} ({item.confidence})</li>);   

    return (
      <div className={ styles.newsSentiment }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Data received from : {this.state.currentkeywords}</span>              
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
