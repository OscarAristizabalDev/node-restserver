// ========================
// puerto
// ========================
process.env.PORT = process.env.PORT || 8080

// ========================
// Entorno
// ========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
// Vencimiento del token
// ========================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ========================
// SEED de autenticación
// ========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ========================
// Base de datos
// ========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = process.env.MONGO_URI
}

process.env.URLDB = urlDB;


// ========================
// Google Cliente ID
// ========================
process.env.CLIENTE_ID = process.env.CLIENTE_ID || '730745521822-iguicjtd5k96fam7s93nmnkgqbpgh4ls.apps.googleusercontent.com';