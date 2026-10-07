//Usando commonjs
const express = require('express');

//Crea instancia de la aplicacion.
//Es el objeto sobre el que se va a ir colgando rutas y middlewares
const app = express();
//Usa variable de entorno si existe
const PORT = process.env.PORT || 4000;

//Define una ruta get, que responde JSON, un endpoint de health check es una vencion comun, para 
//que un balanceador de carga, un pipeline de CI/CD o yo pueda confirmar rapido
//Si el servidor esta vivo, sin tocar logica del negocio
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


//Arranca el servidor y lo deja escuchando
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

//Probar el health 
//CURL http://localhost:4000/health
//O navegador http://localhost:4000/health