const express = require('express');
const { register, login, refresh, logout, me} = require('../controllers/auth.controller');
const {authenticate} = require('../middlewares/auth.middleware')

const router = express.Router();

//Endpoints
router.post('/register', register);

router.post('/login', login)

router.post('/refresh', refresh)

router.post('/logout', logout)

router.get('/me', authenticate, me);

module.exports = router;