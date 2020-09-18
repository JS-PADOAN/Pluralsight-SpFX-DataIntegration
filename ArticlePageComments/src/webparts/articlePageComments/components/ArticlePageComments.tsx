import * as React from 'react';
import styles from './ArticlePageComments.module.scss';
import { IArticlePageCommentsProps } from './IArticlePageCommentsProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class ArticlePageComments extends React.Component<IArticlePageCommentsProps, {}> {
  public render(): React.ReactElement<IArticlePageCommentsProps> {
    return (
      <div className={ styles.articlePageComments }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.description)}</p>
              <a href="https://aka.ms/spfx" className={ styles.button }>
                <span className={ styles.label }>Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
