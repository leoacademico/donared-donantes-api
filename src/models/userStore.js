// Almacenamiento en memoria de usuarios.
// En un proyecto real esto sería reemplazado por una base de datos (p. ej. PostgreSQL/Mongo).
const bcrypt = require('bcryptjs');
const { roles } = require('../config');

let users = [];
let nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

function findByUsername(username) {
  return users.find((u) => u.username === username);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function createUser({ username, password, role }) {
  if (findByUsername(username)) {
    throw new Error('El usuario ya existe');
  }
  const validRoles = Object.values(roles);
  const assignedRole = validRoles.includes(role) ? role : roles.USER;

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: nextId++,
    username,
    passwordHash,
    role: assignedRole,
  };
  users.push(user);
  return user;
}

function validatePassword(user, plainPassword) {
  return bcrypt.compareSync(plainPassword, user.passwordHash);
}

function toSafeUser(user) {
  if (!user) return null;
  const { id, username, role } = user;
  return { id, username, role };
}

module.exports = {
  reset,
  findByUsername,
  findById,
  createUser,
  validatePassword,
  toSafeUser,
};
