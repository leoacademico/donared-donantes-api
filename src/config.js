// Configuración centralizada del módulo.
// En producción, JWT_SECRET debe definirse como variable de entorno.
const config = {
  jwtSecret: process.env.JWT_SECRET || 'clave-secreta-de-desarrollo-cambiar-en-produccion',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  roles: {
    ADMIN: 'administrador',
    USER: 'usuario',
  },
};

module.exports = config;
