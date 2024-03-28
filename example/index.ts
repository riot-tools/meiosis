import './types.d.ts';
import { mount, register } from 'riot';

import SampleComponent from './component.riot';

import { dispatch, stream } from './state';

declare global {

    interface Window {

        clickme: () => void;
    }
}

window.clickme = () => {

    const { buttonclicked } = stream.state();

    dispatch({ buttonclicked: buttonclicked+1 })
}


register('samplecomponent', SampleComponent);
mount('samplecomponent');
