import { DynamicProperty } from "@microsoft/sp-component-base";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IData } from "../../../data/IData";

export interface INewsSentimentProps {
  description: string;
  keywords: DynamicProperty<IData>;
  context : WebPartContext;
  textSentimentApiKey?: string;
  bingKey?: string;
  chosenSentiment? : string;
  displaydonut:boolean;
}
