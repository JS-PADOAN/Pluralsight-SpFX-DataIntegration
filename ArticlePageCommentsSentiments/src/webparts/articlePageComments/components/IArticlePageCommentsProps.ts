import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IArticlePageCommentsProps {
  description: string;
  context : WebPartContext;
  textSentimentApiKey?: string;
  chosenSentiment? : string;
}
