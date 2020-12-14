const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// paquetes para el manejo de rutas y archivos
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));


/**
 * Funcion para cargar archivos
 */
app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // si no hay ningun archivo
    if (!req.files) {
        return res.status(400).json({
            status: 400,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    // validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            status: 400,
            err: {
                mensaje: 'Las tipos permitidas son ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    // Se obtiene el archivo enviado
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'git', 'jpeg'];

    // si la extension no esta en las validas
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            status: 400,
            err: {
                mensaje: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    // Se cambia el nombre del archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function(err) {
        // Si se da un error
        if (err) {
            return res.status(500).json({
                status: 500,
                err
            })
        }


        // En este punto ya se subio la imagen

        // Se valida cual es el tipo de peticion
        if (tipo === 'usuarios') {
            // Se llama el metodo imagenUsuario
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });
});


/**
 * Permite asociar la imagen que se acaba de subir al usuario
 * si en caso de que un usuario ya tenia una imagen, lo que hacemos es borrarla
 * @param {*} id identificador del usuario
 * @param {*} res response
 * @param {*} nombreArchivo nombre del archivo que se subio
 */
function imagenUsuario(id, res, nombreArchivo) {

    // Se busca el usuario
    Usuario.findById(id, (err, usuarioDB) => {
        // En caso de error en la base de datos, se borra la imagen que ya se subio
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                status: 500,
                err
            })
        }

        // Si el usaurio no existe, se borra la imagen que ya se subio
        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                status: 400,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        // Se borrar el la imagen que se subio previamente para que solo quede la actual
        borrarArchivo(usuarioDB.img, 'usuarios');

        // Se registra la nueva imagen en el usuario
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                status: 200,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    });
}

function imagenProducto(id, res, nombreArchivo) {
    // Se busca el producto
    Producto.findById(id, (err, productoDB) => {
        // En caso de error en la base de datos, se borra la imagen que ya se subio
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                status: 500,
                err
            })
        }

        // Si el usaurio no existe, se borra la imagen que ya se subio
        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                status: 400,
                err: {
                    message: 'producto no existe'
                }
            });
        }
        // Se borrar el la imagen que se subio previamente para que solo quede la actual
        borrarArchivo(productoDB.img, 'productos');

        // Se registra la nueva imagen en el usuario
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                status: 200,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    });
}

/**
 * Permite borrar la imagen del usuario
 * @param {*} nombreImagen 
 * @param {*} tipo 
 */
function borrarArchivo(nombreImagen, tipo) {
    // Se crea la ruta donde esta la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // Si hay una imagen
    if (fs.existsSync(pathImagen)) {
        // Se borra la imagen
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;