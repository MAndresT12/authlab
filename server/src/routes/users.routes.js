const express = require('express');
const { listUsers } = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

//Primero identifica al usuario, luego verifica que tenga el rol de admin para poder listar usuarios
//y recien ahi listUsers, si no tiene el rol de admin, no se ejecuta listUsers y se devuelve un 403 Forbidden.
router.get('/', authenticate, authorize('admin'), listUsers);

module.exports = router;