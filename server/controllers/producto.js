const express = require('express');

const { verificarToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');
let Categoria = require('../models/categoria');

/**
 * Obtener todos los productos
 */
app.get('/productos', verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    // trae todos los productos disponibles
    // populate: usuario categoria
    // paginado
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            // Si hay un error en base de datos
            if (err) {
                return res.status(500).json({
                    status: 500,
                    err
                });
            }
            // en caso de que no haya error, se retorna los productos
            res.json({
                status: 200,
                productos
            });
        });
});

/**
 * Obtener un producto por ID
 */
app.get('/productos/:id', verificarToken, (req, res) => {
    // populate: usuario categoria
    // paginado
    // Se obtiene el id del producto
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            /**if (err) {
                return res.status(500).json({
                    status: 500,
                    err
                });
            }*/
            // Si no encuentra el producto
            if (!productoDB) {
                return res.status(400).json({
                    status: 400,
                    error: {
                        message: 'Producto no encontrado, el id no es valido'
                    }
                });
            }
            // En caso de actualizar el producto, se retorna la respuesta
            res.json({
                status: 200,
                producto: productoDB
            });
        });
})


/**
 * Buscar productos
 */
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    // Se obtiene el termino de busqueda
    let termino = req.params.termino;
    // este metodo permita hacer busqueda por coincidencia de valores ingresados
    let regex = new RegExp(termino, 'i');
    // Se busca el producto
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            // En caso de error de consulta en base de datos
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            // Se envía la respuesta
            res.json({
                status: 200,
                productos
            })
        });
});

/**
 * Crea un producto
 */
app.post('/productos', verificarToken, (req, res) => {

    // Se obtiene el body
    let body = req.body;
    // Se busca primero la categoria 
    Categoria.findById(body.categoria_id, (err, categoriaDB) => {
        if (!categoriaDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'La categoria no existe, por lo tanto no se puede registrar el producto'
                }
            });
        }
    });
    // si encuentra una categoria puede continuar con el registro
    // Se instancia el producto a registrar
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria_id,
        usuario: req.usuario._id
    });
    // Se guarda el producto
    producto.save((err, productoDB) => {
        // Si se presenta algun error del servidor o en la base de datos
        if (err) {
            return res.status(500).json({
                status: 500,
                err
            });
        }
        // Si por algún motivo no se creo el producto
        if (!productoDB) {
            return res.status(400).json({
                status: 400,
                err
            });
        }
        // Se da respuesta cuando se registra el producto
        res.json({
            status: 200,
            mensaje: 'Producto registrad0 correctamente',
            producto: productoDB
        })
    });
});


/**
 * Actualizar un producto
 */
app.put('/productos/:id', verificarToken, (req, res) => {

    // Se obtiene el Id enviados
    let id = req.params.id;
    // Se obtiene los datos recibidos
    let body = req.body;

    // Se busca el producto
    Producto.findById(id, (err, productoDB) => {
        // Si se da un error en el servidor o en la base de datos
        /**if (err) {
            return res.status(500).json({
                status: 500,
                err
            })
        }*/
        // Si no se actualiza la categoria
        if (!productoDB) {
            return res.status(400).json({
                status: 400,
                error: {
                    mensaje: 'Producto no encontrado, el id no es valido'
                }
            })
        }

        // producto a actualizar
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria_id = body.categoria_id;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    status: 500,
                    err
                });
            }

            res.json({
                status: 200,
                mensaje: 'Producto actualizado correctamente',
                producto: productoGuardado
            });

        });


    })

});


/**
 * Borrar un producto
 */
app.delete('/productos/:id', verificarToken, (req, res) => {

    // Se obtiene el id del registra a eliminar
    let id = req.params.id;
    let updateDisponible = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, updateDisponible, { new: true, runValidators: true, context: 'query' }, (err, productoActualizar) => {
        if (err) {
            return res.status(500).json({
                status: 500,
                error: err
            });
        }

        if (!productoActualizar) {
            return res.status(400).json({
                status: 400,
                error: {
                    message: 'Procucto no encontrado'
                }
            });
        }

        res.json({
            status: 200,
            producto: productoActualizar,
            message: 'Se ha eliminado el producto correctamente'
        });
    });

});




module.exports = app;