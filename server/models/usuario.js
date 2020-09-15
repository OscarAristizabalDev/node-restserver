const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidados = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidados
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

});

//permite omitir que campos se deben responder
//cuando se registra un nuevo usuario
usuarioSchema.methods.toJson = function() {

    let user = this;
    let userObject = user.toObject();
    //en este caso únicamente se quita el password
    delete userObject.password;

    return userObject;
}

//valida el correo duplicado
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);