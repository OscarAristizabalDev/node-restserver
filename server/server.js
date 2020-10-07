require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
// paquete propio de note para navegar en las carpeta el proyecto
const path = require('path');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuración global de rutas
app.use(require('./controllers/index'));

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    (err, resp) => {

        if (err) {
            console.log(err);
        } else {
            console.log('Base de datos ONLINE');
        }
    });

app.listen(process.env.PORT, () => {
    console.log(`Escuchando en puerto ${process.env.PORT}`);
});