//Anteriormente todo vivia bajo /api/auth porque era sobre la sesion misma.
//Listar usuarios ya es sobre el recurso de usuarios, asi que le damos su propio archivo,
//separar por recurso es la convencion real en APIs REST.


const User = require('../models/User');

async function listUsers(req, res) {
  try {
    const users = await User.find().select('-password -refreshTokenHash');
    return res.json(users);
  } catch (error) {
    console.error('Error en listUsers:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { listUsers };