import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Dashboard(){
    const { user, logout} = useAuth();
    const navigate = useNavigate();

    async function handleLogout(){
        await logout();
        navigate('/login');
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Sesión iniciada como {user?.email}</p>
            <p>Rol: {user?.role}</p>

            {user?.role === 'admin' && <Link to="/admin/users">Ver usuarios</Link>} 

            <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
    )
}

export default Dashboard;