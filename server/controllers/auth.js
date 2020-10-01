const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


/**
 * Permite iniciar sesión
 */
app.post('/login', (req, res) => {
    // Se obtiene los valores enviados en la petición
    let body = req.body;
    // Se busca un unico usuario por el email enviado
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        // si se genera un error de servidor 
        if (err) {
            return res.status(500).json({
                status: 500,
                error: err
            });
        }
        // si no existe un usuario
        if (!usuarioDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    mensaje: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        //se valida que la contraseña enviada por el usuario sea igual a la contraseña registrada
        //en base de datos
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                status: 400,
                error: {
                    mensaje: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        //Se envía la respuesta
        res.json({
            status: 200,
            usuario: usuarioDB,
            token: token
        })
    });

})







module.exports = app;