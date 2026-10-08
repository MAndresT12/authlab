import axios, { type AxiosInstance } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authStorage';
//Ademas de las propiedades globales de window, agregamos la propiedad api para que TypeScript no marque error al usarla
//window.location, window.document, window.localStorage, etc. son propiedades globales de window, pero window.api no lo es, por lo que TypeScript marca error al usarla. Para solucionarlo, podemos declarar la propiedad api en la interfaz Window de TypeScript.
declare global {
  interface Window {
    api: AxiosInstance;
  }
}
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});


//Corre antes de cada peticion que salga por api, lee el access token guardado y,
//si existe, lo mete en el header Authorization de la peticion. Esto es necesario para que el backend pueda validar el token y permitir o denegar el acceso a los recursos protegidos.
//Asi ningun componente, tiene que preocuparse de meter el token en el header, ya que esto se hace automaticamente antes de cada peticion.
//.use(...) cada vez que vaya a salir una peticion, ejecuta esta funcion.
//Parte de config es, por ejm:
/*
{
  method: 'GET',
  url: '/users',
  headers: ...
}
*/
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Corre despues de cada peticion que salga por api, si la respuesta es 401 (Unauthorized), 
// intenta refrescar el access token usando el refresh token guardado. Si el refresh token es valido, guarda el nuevo access token y refresh token 
// y reintenta la peticion original. Si el refresh token no es valido, limpia los tokens guardados y rechaza la promesa con el error.

//Recibe cada respuesta con status de error. Si es exactamente un 401 y esta peticion todavia no se reintento (!originalRequest._retry),
//intenta refrescar.
//originalRequest._retry = true, marca la peticion como ya reintentada. Sin esto, si el refresh "funciona" pero el nuevo access token tambien fallara por algun motivo, se entraria en un loop infinito de reintentos
//La primera funcion se ejecuta cuando la peticion fue exitosa, por ejemplo 200 ok simplemente dice return response, la segunda funcion se ejecuta cuando la peticion fallo, por ejemplo 401 Unauthorized
api.interceptors.response.use((response) => response, async (error) => {
    //Cuando Axios recibio el 401, error.config contiene la peticion que fallo, por ejemplo:
    /* guarda la peticion que acaba de fallar, para poder reintentarlo despues de refrescar el token
        GET /users
        Authorization: Bearer TOKEN_EXPIRADO
    */
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No hay refresh token');

        //Usar instancia base axios.post y no api.post para evitar que se vuelva a llamar al interceptor de request y se meta el access token viejo en la peticion de refresh
        // const response = await axios.post(...);

        // const data = response.data;
        //Pero usamos desestructuring para obtener directamente data de la respuesta, ya que axios devuelve un objeto con varias propiedades, y solo nos interesa data
        const { data } = await axios.post('http://localhost:4000/api/auth/refresh', {
          refreshToken,
        });

        setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        //Axios, vuelve a ejecutar la peticion que fallo, pero ahora con el nuevo access token
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        //propaga error hacia quien hizo la peticion
        return Promise.reject(refreshError);
      }
    }
    //Si el error NO es 401, no queremos intentar refrescar el token, simplemente propagamos el error hacia quien hizo la peticion
    return Promise.reject(error);
  }
);

// if (import.meta.env.DEV) {
//   (window as any).api = api;
// }

if (import.meta.env.DEV) {
    //Para poder usar por ejemplo en herramientas de development como React DevTools, la instancia de axios creada en este archivo, la guardamos en window.api. Esto es util para poder hacer peticiones desde la consola del navegador sin tener que importar axios y configurar la baseURL y los interceptores cada vez.
  window.api = api;
}

export default api;