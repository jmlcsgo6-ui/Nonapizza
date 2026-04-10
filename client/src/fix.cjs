const fs = require('fs');
let c = fs.readFileSync('c:/Users/User/Desktop/nona/client/src/index.css', 'utf8');
c = c.replace(/\\n/g, '\n');
fs.writeFileSync('c:/Users/User/Desktop/nona/client/src/index.css', c);
