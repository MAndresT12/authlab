import { useEffect, useState } from 'react';
import api from '../lib/api';
import type {User} from '../types';

function AdminUsers(){
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadUsers(){
            try{
                //<User[]> es un generico de TypeScript que le dice a axios que espere un array de objetos User en la respuesta. Esto nos permite tener autocompletado y validacion de tipos en el codigo que sigue.
                const {data} = await api.get<User[]>('/users');
                setUsers(data);

            }finally{
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    if(loading) return <p>Cargando usuarios...</p>

    return(
       <div>
        <h1>Usuarios</h1>
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.email} - {user.role}</li>
            ))}
        </ul>

        </div>
    )   

}

export default AdminUsers;