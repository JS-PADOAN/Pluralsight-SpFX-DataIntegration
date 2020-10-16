import * as React from 'react';
import styles from './ArticlePageCommentsSentimentsPnp.module.scss';
import { IArticlePageCommentsSentimentsPnpProps } from './IArticlePageCommentsSentimentsPnpProps';
import { IArticlePageCommentsSentimentsPnpState } from './IArticlePageCommentsSentimentsPnpState';
import { escape } from '@microsoft/sp-lodash-subset';

import { sp } from "@pnp/sp/presets/all";  

import { IArticlePage } from './IArticlePage';
import { SentimentService } from './Services/SentimentService';
import IPageComment from './IPageComment';

import { Rating, RatingSize } from 'office-ui-fabric-react/lib/Rating';


export default class ArticlePageCommentsSentimentsPnp extends React.Component<IArticlePageCommentsSentimentsPnpProps, IArticlePageCommentsSentimentsPnpState> {
    
  //Service declaration
  private service:SentimentService;
  
   // constructor to intialize state and pnp sp object.  
   constructor(props: IArticlePageCommentsSentimentsPnpProps,state:IArticlePageCommentsSentimentsPnpState) {  
    super(props);  

    let c = props.context;
  
    //Service instanciation
      this.service = new SentimentService(
        c.pageContext.web.absoluteUrl,
        c.pageContext.list && c.pageContext.list.id.toString(),
        c.pageContext.listItem && c.pageContext.listItem.id.toString(),
        c.spHttpClient,
        c.httpClient, props.textSentimentApiKey
      );

    this.state = {page : undefined };  
    sp.setup({  
      spfxContext: this.props.context  
    });  
  }  

  public async componentDidMount(): Promise<void> {  
    let p = await this.getMostRecentPage();
    
    await this.service.calculateSentiments(p.comments);            
    
    this.setState({page: p });
  }

//retrieve the most recent pages and its top 5 comments 
private async getMostRecentPage() : Promise<IArticlePage>{  
  let pages = await sp.web.lists.getByTitle("Site Pages").items.select("Title, FileRef, EncodedAbsUrl").orderBy("Modified", false).top(1).get();
  let p = pages[0];

  let returnedpage: IArticlePage =  { title : p.title, fileRef: p.FileRef, encodedAbsUrl: p.EncodedAbsUrl, comments:[]};

  const item = await sp.web.getFileByServerRelativeUrl(p.FileRef).getItem();
  
  await item.comments.top(5).get().then((comments) => { 
    
    let i:number = 0;
    let mappedComments = comments.map( (c) => {
      let comment:IPageComment = { id:i++, language:"unknown", Sentiment:"undefined", confidence:1, author : c.author.email, comment : c.text}
      return comment;
    } )  
  
    returnedpage.comments = mappedComments

  });
  
  return returnedpage;  
 }  

  public render(): React.ReactElement<IArticlePageCommentsSentimentsPnpProps> {

    let validItems = this.state.page && this.state.page.comments
  .filter((item) => item.Sentiment == "positive");

    let items = validItems && validItems
    .map((item) => <li>{item.comment}, ({item.language}) Sentiment : {item.Sentiment} ({item.confidence})</li>);  

    let rating = 0;
    if(validItems)
    {
      rating = (validItems.length / this.state.page.comments.length)*10
    }

    return (
      <div className={ styles.articlePageCommentsSentimentsPnp }>               
      <span>Positive feeling on the last article</span>
        <Rating min={1} max={10} size={RatingSize.Large} rating={rating}/>               
      </div>
    );
  }
}
