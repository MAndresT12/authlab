const jwt = require('jsonwebtoken');
//Modulo nativo de NODE
const crypto = require('crypto');

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
}

function hashToken(token) {
    //sha256 en vez de bcrypt. La razón: bcrypt es lento y con "sal" a propósito, porque está pensado
    //  para proteger secretos de baja entropía que un humano elige (passwords cortos, reutilizados, adivinables).
    //  Un refresh token ya es una cadena larga y aleatoria generada por la máquina — no hay nada que "adivinar" 
    // por fuerza bruta, así que un hash rápido como sha256 es suficiente y no vale la pena pagar el costo de bcrypt aquí.
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateAccessToken, generateRefreshToken, hashToken };