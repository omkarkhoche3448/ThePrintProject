const { getPrinters } = require("unix-print");

getPrinters().then(console.log).catch(console.error);
