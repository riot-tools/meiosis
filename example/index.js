import "regenerator-runtime/runtime";

import { mount, register } from 'riot';

import SampleComponent from './component';

import { dispatch, stream } from './state';

window.clickme = () => {

    const { buttonclicked } = stream.state();

    dispatch({ buttonclicked: buttonclicked+1 })
}


register('samplecomponent', SampleComponent);
mount('samplecomponent');
