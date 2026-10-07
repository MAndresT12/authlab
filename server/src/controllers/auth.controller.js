const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {generateAccessToken, generateRefreshToken, hashToken }= require('../utils/tokens')


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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    //ANTES
    // const accessToken = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    // );

    // return res.json({
    //   accessToken,
    //   user: {
    //     id: user._id,
    //     email: user.email,
    //     role: user.role,
    //   },
    //});

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },

    });
  } catch (error) {
    console.error('Error en login:', error.message);

    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: 'Refresh token inválido' });
    }

    const isValid = hashToken(refreshToken) === user.refreshTokenHash;
    if (!isValid) {
      return res.status(401).json({ message: 'Refresh token inválido' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Error en refresh:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function logout(req, res){
  try{
    const {refreshToken} =req.body;

    if(!refreshToken){
      //Bad request, servidor no puede procesar peticion porque sintaxis es incorrecta o mal formada
      return res.status(400).json({
        message: 'Refresh token requerido'
      });
    }

    let payload
    try{
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    }catch(error){
      //Sin contenido, servidor proceso solicitud con exito pero no necesita enviar ningun dato de respuesta
      //No es un erroro, pertenece grupo de codigos de exito (2xx)
      return res.status(204).send();
    }
    
    await User.findByIdAndUpdate(payload.id, { refreshTokenHash: null })

    return res.status(204).send();

  }catch(error){
    console.error('Error en logout: ', error.message);
    //Error interno del servidor, se encontro un fallo o una condicion inesperada que impidio completar la solicitud
    return res.status(500).json({message: 'Error interno del servidor'})
  }
}

module.exports = { register, login, refresh, logout};