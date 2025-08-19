const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve(__dirname, './sdk-settings.json'))

const arg = process.argv;

/* For customize json */
const newContent = JSON.parse(content);
newContent.build.win.productVersion = arg[2];

fs.writeFileSync(path.resolve(__dirname, `../build/package.json`), JSON.stringify(newContent, null, 2));

