import * as React from 'react';
import styles from './NewsSentiment.module.scss';
import { INewsSentimentProps } from './INewsSentimentProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { INewsSentimentState } from './INewsSentimentState';
import { IData } from '../../../data/IData';

import * as $ from 'jquery';
//import * as pgw from 'pgwslider';
require('../../../../node_modules/pgwslider/pgwslider.js');
require('../../../../node_modules/pgwslider/pgwslider.css');

 
import { ChartControl, ChartType } from '@pnp/spfx-controls-react/lib/ChartControl';

import { 
  HttpClient,  
  IHttpClientOptions,
  HttpClientResponse
} from "@microsoft/sp-http";
import INews from './INews';
  
import * as ReactDOM from 'react-dom';

export default class NewsSentiment extends React.Component<INewsSentimentProps, INewsSentimentState> {
 
  private _cognitiveServicesTextUrl: string = "https://js-textanalytics.cognitiveservices.azure.com/text/analytics/v3.0/";
  private _bingSearchUrl: string = "https://js-bingsearch.cognitiveservices.azure.com/bing/v7.0/news";
  
  private _ApihttpClient: HttpClient;

  private currentkeyword:IData;

  private currentslider:any;

  constructor(props) {
    super(props);
    this.state = {
      news : []      
    };
  }

  public componentWillMount(): void { 
      this._ApihttpClient = this.props.context.httpClient;       
    }

  public async componentDidMount() {        
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data)
      {
        this.LoadNews(data);        
      }                                 
  }

  public async componentDidUpdate?(prevProps: INewsSentimentProps, prevState: INewsSentimentState, snapshot: any): Promise<void> {
    
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data && this.currentkeyword != data)
    {            
      await this.LoadNews(data);   
      
      this.currentkeyword = data;               
    }
    else{
      this.EnsureSlider();
    }
  }

   private LoadNews(data : IData): void {
    this._getNewsFromBing(data).then (c=> {
      this._getSentiments(c).then(c2 => {
        this.setState({ news: c2 });         
               
        this.EnsureSlider();
      
      });
    });         
  }

  private EnsureSlider()   {
    if(!this.currentslider)
        {                   
          var newConfig:any={};
          newConfig.listPosition = "left";
          newConfig.displayControls=true;
          newConfig.selectionMode="click";

          this.currentslider = ($('.pgwSlider') as any).pgwSlider(newConfig);
        }
        else{
          this.currentslider.reload(true);
        }
  }


  private async _getSentiments(currentnews: INews[]): Promise<INews[]> {   
    const body: any = {
      documents: currentnews.map(n => { return {id: n.id, text: n.description};})
    };   
    body.language = currentnews[0].language;   //assuming that all news are from the same language

    const cognitiveResponse: HttpClientResponse = await this._ApihttpClient.post(
      `${this._cognitiveServicesTextUrl}sentiment`,
      HttpClient.configurations.v1,
      {       
        body: JSON.stringify(body),
        headers: this._prepareHeadersForSentimentApi()
      }
    );
    const cognitiveResponseJSON: any = await cognitiveResponse.json();

    if (cognitiveResponseJSON.documents.length == currentnews.length) {

      for (let i: number = 0; i < currentnews.length; i++)
      {
        const doc = cognitiveResponseJSON.documents[i];
        const sentiment = doc.sentiment;
        console.log("sentiment for id "+ currentnews[i].id+" : "+ sentiment);
        
        currentnews[i].Sentiment = sentiment;

        switch(sentiment)
        {
          case "positive" : { currentnews[i].confidence = doc.confidenceScores.positive; break;}
          case "neutral" : { currentnews[i].confidence = doc.confidenceScores.positive; break;}
          case "negative" : { currentnews[i].confidence = doc.confidenceScores.positive; break;}
        }        
      }      
    }
    else
    {
      currentnews.forEach( c=> { c.Sentiment = "undefined";c.confidence = 1;});            
    }
    return currentnews;
  }

  private async _getNewsFromBing(data : IData): Promise<INews[]> {    

    const response: HttpClientResponse = await this._ApihttpClient.get(
      `${this._bingSearchUrl}?category=${data}&mkt=en-US&originalImg=true`,
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
        thumbnail : c.image.thumbnail.contentUrl+"&w=800&p=0",
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

  public RenderDonut() {

    let positiveNews = this.state.news.filter((item) => item.Sentiment == "positive").length;
    let NeutralNews = this.state.news.filter((item) => item.Sentiment == "neutral").length;
    let NegativeNews = this.state.news.filter((item) => item.Sentiment == "negative").length;

    // set the data
    const chartData  = {
        labels:
          [
            'Positive', 'Neutral', 'Negative'
          ],
        datasets: [
          {
            label: 'news',
            data:
              [
                positiveNews, NeutralNews, NegativeNews
              ]
          }
        ]
      };

    // set the options
    const options = {
        legend: {
          display: true,
          position: "left"
        },
        title: {
          display: true,
          text: "News Sentiments"
        }
      };
      if(this.props.displaydonut)
      {
        return (
          <ChartControl
            type={ChartType.Doughnut}
            data={chartData}
            options= { options }
          />);
      }
      else
      {
        return (<div/>);
      }
  }
   
  public render(): React.ReactElement<INewsSentimentProps> {
   
    let validItems = this.state.news
    .filter((item) => item.Sentiment == this.props.chosenSentiment);
    
        let items = validItems
          .map((item) => <li><img src={item.thumbnail}/><span>{item.name}</span></li>);   
      
    return (             
      <div className={ styles.newsSentiment }>            
          <div className="cntr mt20">        
            <ul className="pgwSlider">
              {items}
            </ul>                                         
          </div>  
          <div>
            { this.RenderDonut() }
          </div>    
      </div>              
    );   
   
  }
}
