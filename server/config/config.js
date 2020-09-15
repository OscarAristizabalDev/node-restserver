// ========================
// puerto
// ========================
process.env.PORT = process.env.PORT || 8080

// ========================
// Entorno
// ========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
// Base de datos
// ========================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://oscar:9mBfDCnfVyf0QPJm@sandbox.axmt8.mongodb.net/cafe?retryWrites=true&w=majority';
}

process.env.URLDB = urlDB;