// Almacenamiento en memoria de personas donantes.
let donors = [];
let nextId = 1;

function reset() {
  donors = [];
  nextId = 1;
}

function getAll() {
  return donors;
}

function getById(id) {
  return donors.find((d) => d.id === id);
}

function create({ name, email, bloodType, phone }) {
  if (!name || !email) {
    throw new Error('name y email son obligatorios');
  }
  if (donors.some((d) => d.email === email)) {
    throw new Error('Ya existe un donante con ese email');
  }
  const donor = {
    id: nextId++,
    name,
    email,
    bloodType: bloodType || null,
    phone: phone || null,
    createdAt: new Date().toISOString(),
  };
  donors.push(donor);
  return donor;
}

function update(id, updates) {
  const donor = getById(id);
  if (!donor) return null;
  const { name, email, bloodType, phone } = updates;
  if (name !== undefined) donor.name = name;
  if (email !== undefined) donor.email = email;
  if (bloodType !== undefined) donor.bloodType = bloodType;
  if (phone !== undefined) donor.phone = phone;
  return donor;
}

function remove(id) {
  const index = donors.findIndex((d) => d.id === id);
  if (index === -1) return false;
  donors.splice(index, 1);
  return true;
}

module.exports = {
  reset,
  getAll,
  getById,
  create,
  update,
  remove,
};
