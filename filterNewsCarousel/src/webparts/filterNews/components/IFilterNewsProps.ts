import { IData } from "../../../data/IData";

export interface IFilterNewsProps {
  description: string;
  onDataChanged:(data:IData) => void;
}
