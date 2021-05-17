const { JSDOM } = require('jsdom');


const { window, document } = new JSDOM('');

global.window = window;
global.document = document;
