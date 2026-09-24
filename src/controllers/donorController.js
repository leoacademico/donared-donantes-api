const donorStore = require('../models/donorStore');

function listDonors(req, res) {
  return res.json({ donors: donorStore.getAll() });
}

function getDonor(req, res) {
  const id = Number(req.params.id);
  const donor = donorStore.getById(id);
  if (!donor) {
    return res.status(404).json({ error: 'Donante no encontrado' });
  }
  return res.json({ donor });
}

function createDonor(req, res) {
  const { name, email, bloodType, phone } = req.body || {};
  try {
    const donor = donorStore.create({ name, email, bloodType, phone });
    return res.status(201).json({ donor });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

function updateDonor(req, res) {
  const id = Number(req.params.id);
  const donor = donorStore.update(id, req.body || {});
  if (!donor) {
    return res.status(404).json({ error: 'Donante no encontrado' });
  }
  return res.json({ donor });
}

function deleteDonor(req, res) {
  const id = Number(req.params.id);
  const deleted = donorStore.remove(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Donante no encontrado' });
  }
  return res.status(204).send();
}

module.exports = { listDonors, getDonor, createDonor, updateDonor, deleteDonor };
