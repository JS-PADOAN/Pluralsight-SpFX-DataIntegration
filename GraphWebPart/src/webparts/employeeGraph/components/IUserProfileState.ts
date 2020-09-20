import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export interface IUserProfileState {  
    profile: MicrosoftGraph.User;  
    nbTeams: number;
} 