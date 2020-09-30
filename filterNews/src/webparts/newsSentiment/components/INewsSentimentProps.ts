import { DynamicProperty } from "@microsoft/sp-component-base";
import { IData } from "../../../data/IData";

export interface INewsSentimentProps {
  description: string;
  keywords: DynamicProperty<IData>;
}
