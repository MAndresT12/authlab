//Creacion del contexto

import {createContext} from 'react';
import type {User} from '../types';

export interface AuthContextValue{
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

//Arranca en undefined a proposito, porque no existe un valor por defecto
//sensato antes de que el AuthProvider exista (se monte). El hook useAuth() revisa eso y lanza un error
//claro si alguien lo usa fuera del provider. Esto es mejor que tener un valor por defecto que no tiene sentido y puede llevar a errores silenciosos.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
