import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FilterNewsWebPartStrings';
import FilterNews from './components/FilterNews';
import { IFilterNewsProps } from './components/IFilterNewsProps';

import {
  IDynamicDataPropertyDefinition,
  IDynamicDataCallables, IDynamicDataAnnotatedPropertyValue
} from '@microsoft/sp-dynamic-data';

import { IData } from '../../data/IData';

export interface IFilterNewsWebPartProps {
  description: string;
}

export default class FilterNewsWebPart extends BaseClientSideWebPart<IFilterNewsWebPartProps> implements IDynamicDataCallables {  

private _currentData : IData;

/**
   * Event handler for selecting an event in the list
   */
  private onDataChanged = (data: IData): void => {  
    // store the currently selected event in the class variable. Required
    // so that connected component will be able to retrieve its value
    this._currentData = data;
    // notify subscribers that the keywords has changed
   this.context.dynamicDataSourceManager.notifyPropertyChanged('keywords');    //id of the property
  }

  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [      
      { id: 'keywords', title: 'Keywords' }      
    ];
  }

  /**
   * Return the current value of the specified dynamic data set
   * @param propertyId ID of the dynamic data set to retrieve the value for
   */
  public getPropertyValue(propertyId: string) : IData {    
    if (propertyId == "keywords") {     
      let data = this._currentData ? {keywords : this._currentData.keywords, language: "en"} : undefined; //id of the property
      return data;
    }

    throw new Error('Bad property id');

  }

  /**
   * Returns the friendly annoted values for the property. This info will be used by default SPFx dynamic data property pane fields.
   * @param propertyId the property id
   */
  public getAnnotatedPropertyValue?(propertyId: string): IDynamicDataAnnotatedPropertyValue {
    switch (propertyId) {
      case 'keywords':
        return {
          sampleValue: {
              'keywords': "Sports"
          },
          metadata: {
              'keywords': { title: "Category to filter News"}              
          }
      };      
    }
  }

  protected onInit(): Promise<void> {
   
    // register this web part as dynamic data source
    this.context.dynamicDataSourceManager.initializeSource(this);

    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IFilterNewsProps> = React.createElement(
      FilterNews,
      {
        description: this.properties.description,
        onDataChanged : this.onDataChanged
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
