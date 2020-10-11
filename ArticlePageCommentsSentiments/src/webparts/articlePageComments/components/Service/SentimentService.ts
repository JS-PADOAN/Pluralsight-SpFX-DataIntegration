import IPageComment from "../IPageComment";
import {
    SPHttpClient,
    HttpClient,
    SPHttpClientResponse,
    IHttpClientOptions,
    HttpClientResponse
  } from "@microsoft/sp-http";

export class SentimentService {
    
    private _baseUrl: string;
    private _listId: string;
    private _listItemId: string;
    private _spHttpClient: SPHttpClient;
  
    private _ApihttpClient: HttpClient;

    private _cognitiveServicesTextUrl : string = "https://js-textanalytics.cognitiveservices.azure.com/text/analytics/v3.0/";
    private _textSentimentApiKey: string;

    constructor( baseUrl:string, listId:string, listItemId: string, spHttpClient: SPHttpClient, ApihttpClient: HttpClient, textSentimentApiKey: string)
    {
        this._baseUrl = baseUrl;
        this._listId = listId;
        this._listItemId = listItemId;
        this._spHttpClient = spHttpClient;
        this._ApihttpClient = ApihttpClient;
        this._textSentimentApiKey = textSentimentApiKey;
    }

    public async getCommentsAndCalculateSentiments(): Promise<IPageComment[]> {

        let comments = await this._getTop5PageComments();
        
        return await this.calculateSentiments(comments);            
    }

    public async calculateSentiments(comments:IPageComment[]): Promise<IPageComment[]> {
      for (let index = 0; index < comments.length; index++)
      {
          await this._getSentimentFromComment(comments[index]);
      }  
      return comments;
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
    
    
    
      private async _getSentimentFromComment(comment: IPageComment): Promise<IPageComment> {
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
    
          comment.Sentiment = sentiment;
          comment.language = detectedLanguage;

          switch(sentiment)
          {
            case "positive" :  { comment.confidence = doc.confidenceScores.positive; break; }
            case "neutral" : { comment.confidence = doc.confidenceScores.neutral; break; }
            case "negative" : { comment.confidence = doc.confidenceScores.negative; break; }
          }            
        }
        else
        {
            comment.Sentiment = "undefined";
            comment.language = "unknown"; 
            comment.confidence = 1;
        }
    
        return comment;
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
        requestHeaders.append("Ocp-Apim-Subscription-Key", this._textSentimentApiKey);
    
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
    

}