const User = require('../models/User');

async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
    }

    const user = await User.create({ email, password });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error en register:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { register };