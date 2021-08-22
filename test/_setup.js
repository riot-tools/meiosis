const { JSDOM } = require('jsdom');

const DOM = new JSDOM('');

global.window = DOM.window;
global.document = DOM.document;
