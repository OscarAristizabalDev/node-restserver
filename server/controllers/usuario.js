const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificarToken, verificarRoleAdmin } = require('../middlewares/autenticacion');

const app = express();
/**
 * 
 */
app.get('/usuario', verificarToken, (req, res) => {

    /**return res.json({
        // de esta forma puede obtener el usuario que realiza la petición
        usuario: req.usuario,
    })*/

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // metodo find recobe dos parametros, el primero son los filtro, y el segundo se indican los campos que 
    // quiero que se muestren en la respuesta
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    status: 400,
                    error: err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    status: 200,
                    usuarios,
                    cantidad: conteo
                })
            })


        })

});

/**
 * 
 */
app.post('/usuario', [verificarToken, verificarRoleAdmin], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                status: 400,
                error: err
                    //mensaje: 'El nombre es necesario'
            });
        }

        //usuarioDB.password = null;

        res.json({
            status: 200,
            mensaje: 'Usuario registrado correctamente',
            usuario: usuarioDB
        })

    });

});

/**
 * 
 */
app.put('/usuario/:id', [verificarToken, verificarRoleAdmin], (req, res) => {

    let id = req.params.id;
    // medieante undercore mediante la funcion pick el cual recibe un objeto
    // puedo indicar en el siguiente parametro el arreglo indicando los atributos del objeto
    // que se pueden editar
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //recibe cuatro parametros
    // 1. el id del objeto a actualizar
    // 2. el objeto que se va a actualizar
    // 3. Options
    // new: true se indica que cuando se actualiza, responda con los valores nuevos del objeto actualizado
    // runValidators: true se indica que tenga encuenta las validaciones que tenemos en el modelo
    // context: 'query'
    // 4. un callback con dos parametros, por si se presenta el error, y objeto que se actualizado
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                status: 400,
                error: err
                    //mensaje: 'El nombre es necesario'
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            status: 200,
            mensaje: 'Usuario actualizado correctamente',
            usuario: usuarioDB
        });
    })


});

/**
 * Recibe el id a borrar
 */
app.delete('/usuario/:id', [verificarToken, verificarRoleAdmin], (req, res) => {

    //se obtiene el id del registro a borrar
    let id = req.params.id;
    let updateEstado = {
        estado: false
    };;

    Usuario.findByIdAndUpdate(id, updateEstado, { new: true }, (err, usuarioActualizar) => {
        if (err) {
            return res.status(400).json({
                status: 400,
                error: err
            });
        };

        if (!usuarioActualizar) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            status: 200,
            usuario: usuarioActualizar,
            message: 'Se ha eliminado el usuario correctamente'
        });
    });

    //de esta forma se puede eliminar el usuario o registro fisicamente
    /**Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return res.status(400).json({
                status: 400,
                error: err
            });
        };

        if (!usuarioEliminado) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            status: 200,
            usuario: usuarioEliminado
        });
    });*/

});

module.exports = app;