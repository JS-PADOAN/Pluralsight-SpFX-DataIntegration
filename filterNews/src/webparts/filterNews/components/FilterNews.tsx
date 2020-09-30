import * as React from 'react';
import styles from './FilterNews.module.scss';
import { IFilterNewsProps } from './IFilterNewsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IFilterNewsState } from './IFilterNewsState';
import { MAX_COLOR_VALUE } from 'office-ui-fabric-react';
import { IData } from '../../../data/IData';

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
        { keywords: 'Sports', language:"en" },
      { keywords: 'Enonomy', language:"en" },
      { keywords: 'Health' , language:"en"}
      ], currentData: 'Sports' // default  value
    });
    this.props.onDataChanged( { keywords: 'Sports', language:"en" } ); // default  value
  } 

  public render(): React.ReactElement<IFilterNewsProps> {

    let items = this.state.proposedData
    .map((item) => <option>{item.keywords}</option>);   

    let webpart = this;

    return (      
      <div className={ styles.filterNews }>
        <div className={ styles.container }>
          <select value={this.state.currentData} onChange={function(e) 
            {              
              const val:string = e.target.value;
              console.log(val); 
              webpart.setState({currentData: val});
              const data:IData =  { keywords : val, language:"en" }
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
