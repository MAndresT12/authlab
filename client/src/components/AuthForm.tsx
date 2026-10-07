import { useState } from 'react';

type Mode = 'login' | 'register';

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Ocurrió un error');
        return;
      }

      setMessage(
        mode === 'login' ? '¡Sesión iniciada!' : '¡Cuenta creada, ya puedes iniciar sesión!'
      );
      //Imprimir resultado en la consola para verificar la respuesta del servidor
      console.log(data);
    } catch {
      setMessage('No se pudo conectar con el servidor');
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