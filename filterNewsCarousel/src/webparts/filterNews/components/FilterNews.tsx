import * as React from 'react';
import styles from './FilterNews.module.scss';
import { IFilterNewsProps } from './IFilterNewsProps';
import { IFilterNewsState } from './IFilterNewsState';
import { IData } from '../../../data/IData';

const language:string = "en-US";

export default class FilterNews extends React.Component<IFilterNewsProps, IFilterNewsState> {

  constructor(props) {
    super(props);
    this.state = {
      proposedData: [],
      currentData: ""
    };
  }

  public componentDidMount(): void {
    this.setState({
      proposedData: [
        { keywords: 'Sports', language:language },
      { keywords: 'Business', language:language },
      { keywords: 'World' , language:language },
      { keywords: 'Politics' , language:language },
      { keywords: 'Products' , language:language },
      { keywords: 'Entertainment' , language:language }
      ], currentData: 'Sports' // default  value
    });
    this.props.onDataChanged( { keywords: 'Sports', language:language } ); // default  value
  } 

  public render(): React.ReactElement<IFilterNewsProps> {

    let items = this.state.proposedData
    .map((item) => <option>{item.keywords}</option>);   

    let webpart = this;

    return (      
      <div className={ styles.filterNews }>
        <div className={ styles.container }>
          <select value={this.state.currentData} onChange={ (e) => 
            {              
              const val:string = e.target.value;
              //console.log(val); 
              webpart.setState({currentData: val});
              const data:IData =  { keywords : val, language:language };
              webpart.props.onDataChanged( data );
            } 
          }>
            {items}            
        </select>
        </div>
      </div>
    );
  }
}
