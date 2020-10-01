const express = require('express');
const app = express();


app.use(require('./usuario.js'));
app.use(require('./auth.js'));


module.exports = app;