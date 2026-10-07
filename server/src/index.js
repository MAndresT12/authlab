require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/auth.routes');


connectDB();

const app = express();
const PORT = process.env.PORT || 4000;
 
//Permitir que express lea JSON del body
//Por qué hace falta: sin esta línea, cuando alguien mande un POST 
// con un body JSON (como el registro que estamos por construir), 
// req.body llegaría undefined. Express no interpreta el body por 
// defecto, hay que decírselo explícitamente.
app.use(express.json());


app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});