const jwt = require('jsonwebtoken');

/**
 * Permite verificar el token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
let verificarToken = (req, res, next) => {
    // Se obtiene el token enviado por la cabecera
    let token = req.get('Authorization');
    // función que permite valider que el token enviado sea valido
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        // En caso de no ser valido se retorna un error de Authorizacion
        if (err) {
            return res.status(401).json({
                status: 401,
                err: {
                    message: 'Token no válido'
                }
            })
        };
        // Si el token es correcto, se da next para que el proceso continue
        req.usuario = decoded.usuario;
        next();
    });


};


/**
 * Permite verificar que usuario sea un administrador
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
let verificarRoleAdmin = (req, res, next) => {

    let usuario = req.usuario;

    // si el rol del usuario es diferente ADMIN_ROLE
    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json({
            status: 400,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
    // Si el usuario si es administrador, se da next para que pueda continuar con el proceso
    next();


};

module.exports = {
    verificarToken,
    verificarRoleAdmin
}