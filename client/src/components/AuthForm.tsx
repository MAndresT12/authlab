import { useState } from 'react';
import api from '../lib/api';
import { setTokens} from '../lib/authStorage';
import axios from 'axios';

import {useAuth} from '../context/useAuth';
import {useNavigate} from 'react-router-dom';

type Mode = 'login' | 'register';

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    //Recordemos que en baseURL de la instancia, es /api, por lo que no es necesario ponerlo en el endpoint, ya que axios lo agrega automaticamente. Por eso el endpoint es solo /auth/login o /auth/register
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

    try {


      const {data} = await api.post(endpoint, { email, password });

      if(mode === 'login') {
        setTokens(data.accessToken, data.refreshToken);
        setMessage('¡Sesión iniciada!');
        //No hace falta pedirle a /auth/me al backend para obtener los datos del usuario logueado, ya que el backend ya nos devolvio los datos del usuario en la respuesta de /auth/login. Por eso podemos setear directamente el user con data.user
        setUser(data.user);
        navigate('/dashboard');
      }else{
        setMessage('¡Cuenta creada, ya puedes iniciar sesión!');
      }

      //Imprimir resultado en la consola para verificar la respuesta del servidor
      console.log(data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            setMessage(
            error.response?.data?.message || 'Ocurrió un error en la petición'
            );
        } else {
            setMessage('No se pudo conectar con el servidor');
        }
    } finally {
        setLoading(false);
    }
}

  return (
    <div className="auth-card">
      <h1>AuthLab</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <button
        type="button"
        className="auth-toggle"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setMessage(null);
        }}
      >
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
}

export default AuthForm;