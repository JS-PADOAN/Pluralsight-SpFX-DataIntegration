import IPageComment from "./IPageComment";

export interface IArticlePage {
    encodedAbsUrl: string;
    fileRef:string;
    title : string;  
    comments:IPageComment[];
  }