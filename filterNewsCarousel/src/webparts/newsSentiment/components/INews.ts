export default interface INews {
    id: number;
    url?: string;
    thumbnail?: string;
    name: string;
    description: string;    
    language: string;
    Sentiment: string;
    confidence : number;
}