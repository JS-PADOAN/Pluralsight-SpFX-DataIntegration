import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IArticlePageCommentsSentimentsPnpProps {
  description: string;
  context:WebPartContext; 
  textSentimentApiKey?: string;
}
