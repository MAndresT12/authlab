require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.create({
    email: 'prueba@authlab.com',
    password: '123456',
  });

  console.log('Usuario creado:', user);
  await mongoose.disconnect();
}

run();