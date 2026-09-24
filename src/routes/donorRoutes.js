const express = require('express');
const donorController = require('../controllers/donorController');
const { authenticate, authorize } = require('../middleware/auth');
const { roles } = require('../config');

const router = express.Router();

// Cualquier usuario autenticado (admin o usuario) puede consultar donantes.
router.get('/', authenticate, donorController.listDonors);
router.get('/:id', authenticate, donorController.getDonor);

// Solo el rol administrador puede crear, modificar o eliminar donantes.
router.post('/', authenticate, authorize(roles.ADMIN), donorController.createDonor);
router.put('/:id', authenticate, authorize(roles.ADMIN), donorController.updateDonor);
router.delete('/:id', authenticate, authorize(roles.ADMIN), donorController.deleteDonor);

module.exports = router;
