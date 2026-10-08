//Creacion/provision del estado
import { useEffect, useState, type ReactNode} from 'react';
import type {User} from '../types';
import api from '../lib/api';
import {getAccessToken, getRefreshToken, clearTokens} from '../lib/authStorage';

import {AuthContext} from './AuthContext';


//Al montar la app: si no hay access token guardado, ni siquiera intentamos llamar
//al backend, sabemos de antemano que no hay sesion. Si es que hay uno, llamamos a /auth/me
//para confirmar que sigue siendo valido y traeer los datos frescos del usuario.

//Y aca se conecta con el interceptor, como esta llamada pasa por api (instancia de axios), si ese access token
//ya vencio mientras la pestana estasba cerrada, el interceptor de respuesta va a intentar refrescarlo solo, sin que este codigo tenga
//que saber que eso esta pasando


//exporta componente
export function AuthProvider({children}: {children: ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    //Cada vez que montamos el componente AuthProvider, intentamos cargar el usuario logueado usando el access token guardado. Si no hay access token, no hacemos nada. Si hay access token, hacemos una peticion a /auth/me para obtener los datos del usuario logueado. Si la peticion falla, seteamos user a null. Si la peticion es exitosa, seteamos user con los datos del usuario logueado.
    useEffect(() =>{
        async function loadUser(){
            if(!getAccessToken()){
                setLoading(false)
                return;
            }

            try{
                const {data} = await api.get<User>('/auth/me');
                setUser(data);
            }catch (error){
                console.log(error)
                setUser(null);
            }finally{
                setLoading(false);
            }
        }
        loadUser();
    }, []);
    
    async function logout(){
        const refreshToken = getRefreshToken();
        try{
            await api.post('/auth/logout',{ refreshToken});           
        }catch (error){
            console.log(error);
        }

        clearTokens();
        setUser(null);

    }

    return(
        <AuthContext.Provider value={{user, loading, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

//exporta hook, no componente
// export function useAuth(){
//     const context = useContext(AuthContext);
//     if(!context){
//         throw new Error('useAuth debe usarse dentro de un AuthProvider');
//     }
//     return context;
// }