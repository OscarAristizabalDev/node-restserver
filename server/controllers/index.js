const express = require('express');
const app = express();


app.use(require('./usuario.js'));
app.use(require('./auth.js'));
app.use(require('./categoria.js'));
app.use(require('./producto.js'));


module.exports = app;