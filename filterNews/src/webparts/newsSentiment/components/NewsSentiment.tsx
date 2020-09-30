import * as React from 'react';
import styles from './NewsSentiment.module.scss';
import { INewsSentimentProps } from './INewsSentimentProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { INewsSentimentState } from './INewsSentimentState';
import { IData } from '../../../data/IData';

export default class NewsSentiment extends React.Component<INewsSentimentProps, INewsSentimentState> {

  constructor(props) {
    super(props);
    this.state = {
      currentkeywords : undefined,
      articles : undefined
    }
  }

  public async componentDidMount() {        
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data != undefined)
    {
      this.setState({ currentkeywords : data});
    }
  }

  public async componentDidUpdate?(prevProps: INewsSentimentProps, prevState: INewsSentimentState, snapshot: any): Promise<void> {
    
    const data: IData = this.props.keywords.tryGetValue();
    console.log(data); 
    if(data && prevState.currentkeywords != data)
    {
      this.setState({ currentkeywords : data});
    }
  }

  public render(): React.ReactElement<INewsSentimentProps> {
    return (
      <div className={ styles.newsSentiment }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Data received from Webpart Source : {this.state.currentkeywords}</span>              
            </div>
          </div>
        </div>
      </div>
    );
  }
}
