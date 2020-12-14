const express = require('express');
const app = express();


app.use(require('./usuario.js'));
app.use(require('./auth.js'));
app.use(require('./categoria.js'));
app.use(require('./producto.js'));
app.use(require('./upload.js'));
app.use(require('./imagenes.js'));

module.exports = app;