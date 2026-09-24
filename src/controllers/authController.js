const userStore = require('../models/userStore');
const { signToken } = require('../utils/token');
const { roles } = require('../config');

function register(req, res) {
  const { username, password, role } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const user = userStore.createUser({ username, password, role });
    return res.status(201).json({ user: userStore.toSafeUser(user) });
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }
}

function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  const user = userStore.findByUsername(username);
  if (!user || !userStore.validatePassword(user, password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role });
  return res.json({ token, user: userStore.toSafeUser(user) });
}

module.exports = { register, login, roles };
