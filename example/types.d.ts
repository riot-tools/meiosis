import { RiotComponent } from 'riot';

declare module '*.riot' {

    const component: RiotComponent;
    export default component;
}

export {}