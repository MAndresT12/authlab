//funcion que se ejecuta entre que llega la peticion al backend y que se ejecuta el endpoint final
//guardia de seguridad
const jwt = require('jsonwebtoken');


//Este middleware solo acepta access tokens
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //401 Unauthorized token ausente, invalido o vencido.
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    //401 Unauthorized token ausente, invalido o vencido.
    return res.status(401).json({ message: 'Token de acceso inválido o expirado' });
  }
}


//Es una funcion que devuelve un middleware, para poder parametrizar que roles se permiten en cada ruta:
//authorize('admin'), authorize('admin','editor'), en otra si el dia de manana se agrega mas roles.
//Para enviar varios roles ejemplo admin o editor
//RBAC
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        //Forbidden, sabemos quien eres, pero tu rol no te alcanza para tal accion. 
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
}




module.exports = { authenticate, authorize };
