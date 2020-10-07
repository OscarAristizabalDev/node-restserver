const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENTE_ID);

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

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
});


// Configuraciones de google mediante un metodo asyncrono
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENTE_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // 
    const payload = ticket.getPayload();
    // Se retorna el objeto usuario cuando inicie sesion
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
/**
 * Permite iniciar sesion autenticacion de Google
 */
app.post('/google', async(req, res) => {
    // se recibe el token por req.body
    let token = req.body.idtoken;
    // Se verifica la autenticación mediante el metodo verify
    let googleUser = await verify(token)
        .catch(e => {
            // en caso de error se retorna false
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    // se busca un usuario que tenga con el mismo email de la autenticación con google
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // Si la busqueda genera un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        // si el usuario no existe en la base de datos
        if (!usuarioDB) {
            // Se crea un nuevo usuario
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // Se guarda el usuario en la base de datos
            usuario.save((err, usuarioDB) => {
                // Si hay un error en el registro
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });
        }

        // Si existe un usuario con el mismo email
        if (usuarioDB) {
            // Si el usuario tiene autenticación por google false
            if (usuarioDB.google === false) {
                // retornamo y se indica que debe usuario su atenticación normal
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su atenticación normal'
                    }
                });
            } else {
                // Si el usuario maneja autenticación por google true
                // Se crea o se renueva un nuevo token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // Se retorna el usuario
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        }
    });
    // En caso de que la autenticación sea exitosa se retorna el usuario autenticado 
    // desde Google
    /**res.json({
        usuario: googleUser
    })*/

});









module.exports = app;