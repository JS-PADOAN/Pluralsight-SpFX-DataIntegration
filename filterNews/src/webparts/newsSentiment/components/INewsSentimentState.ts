import { IData } from "../../../data/IData";
import INews from "./INews";

export interface INewsSentimentState {    
    currentkeywords: IData;
    news: INews[]; 
}
