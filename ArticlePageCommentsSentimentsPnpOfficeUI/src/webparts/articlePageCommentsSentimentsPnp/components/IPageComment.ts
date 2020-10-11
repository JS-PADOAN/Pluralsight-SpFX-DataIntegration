export default interface IPageComment {
    id: number;
    author?: string;
    comment: string;
    createdDate?: Date;
    language: string;
    Sentiment: string;
    confidence : number;
}