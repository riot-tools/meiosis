const Path = require('path');
const Fs = require('fs');


const raw = Path.resolve(__dirname, '../components/rmdevtools.js');
const formatted = Path.resolve(__dirname, '../lib/rmdevtools.js');

let contents = Fs.readFileSync(raw).toString();

contents = contents.replace('export default ', 'return ');

const newContent = `export default ({ getStream, connect }) => {\n\n${contents}\n}`;

Fs.writeFileSync(formatted, newContent);
Fs.unlinkSync(raw);