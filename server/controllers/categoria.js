const express = require('express');

let { verificarToken, verificarRoleAdmin } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

/**
 * Mostrar todas las categorias
 */
app.get('/categorias', verificarToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            // Si hay un error en base datos
            if (err) {
                return res.status(500).json({
                    status: 500,
                    err
                });
            }
            // en caso de que no haya error, se retorna las categorias
            res.json({
                status: 200,
                categorias
            })
        });
});


/**
 * Mostrar una categoria por ID
 */
app.get('/categorias/:id', (req, res) => {
    // Se obtiene el id de la categoria
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        /**if (err) {
            return res.status(500).json({
                status: 500,
                err
            });
        }*/

        // Si no encuentra la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Categoria no encontrada, el id no es valido'
                }
            });
        }

        // Se da respuesta
        res.json({
            status: 200,
            categoria: categoriaDB
        });
    });
});


/**
 * Crear una nueva categoria
 */
app.post('/categorias', verificarToken, (req, res) => {
    //regreda la nueva categoria
    // req.usuario._id;

    // Se obtiene el body
    let body = req.body;

    // Se instancia un nuevo objeto categoria
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    // Se guarda la categoria
    categoria.save((err, categoriaDB) => {
        // Si se presenta algun error en la base de datos
        if (err) {
            return res.status(500).json({
                status: 500,
                err
            });
        }
        // Si por algún motivo no se creo la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                status: 400,
                err
            });
        }
        // Se da respuesta cuando se registra la categoria
        res.json({
            status: 200,
            mensaje: 'Categoria registrada correctamente',
            categoria: categoriaDB
        });
    });

});

/**
 * Actualizar la descripción de una categoria
 */
app.put('/categorias/:id', verificarToken, (req, res) => {

    // Se obtiene el Id enviado
    let id = req.params.id;

    //let body = _.pick(req.body, ['descripción']);
    // Se obtiene el body enviado
    let body = req.body;
    // Objeto categoria a Actualizar
    let categoria = {
        descripcion: body.descripcion
    }

    // Se busca y se actualiza la categoria
    Categoria.findByIdAndUpdate(id, categoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        // Si se da un error en el servidor o en la base de datos
        if (err) {
            return res.status(500).json({
                status: 500,
                err
            })
        }
        // Si no se actualiza la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    mensaje: 'Categorita no encontrada'
                }
            })
        }

        res.json({
            status: 200,
            mensaje: 'Categoria actualizada correctamente'
        });
    });
});

/**
 * Eliminar una categoria
 */
app.delete('/categorias/:id', [verificarToken, verificarRoleAdmin], (req, res) => {
    // solo un administrador puede borrar las categorias
    // Categoria.findByIdAndRemove

    // Se obtiene el id enviado
    let id = req.params.id;
    // Se busca y se elimina la categoria
    Categoria.findByIdAndRemove(id, (err, categoriaEliminar) => {
        // Si se da algún error en el servidor o en la base de datos
        if (err) {
            return res.status(500).json({
                status: 500,
                err
            });
        }
        // Si no encuentra la categoria a eliminar
        if (!categoriaEliminar) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Categoria no encontrada, el id no existe'
                }
            });
        }

        res.json({
            status: 200,
            message: 'Se elimino correctamente la categoria',
            categoria: categoriaEliminar
        })

    })

})

module.exports = app;