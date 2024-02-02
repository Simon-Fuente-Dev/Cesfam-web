import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../layout/AuthContext.jsx';
import '../styles/Login.css'
const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  if (currentUser) {
    navigate('/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ([rut, password].includes('')) {
      setError('Por favor, rellena todos los campos.');
      return;
    }
    try {
      const userResponse = await axios.get(`http://localhost:3001/api/obtenerUsuario/${rut}`);

      if (userResponse.status === 200 && userResponse.data.usuario_cuenta) {
        const response = await axios.post('http://localhost:3001/api/ValidarLogin_web', {
          p_rut: rut,
          p_contrasenia: password,
        });

        if (response.status === 200 && response.data.id_cuenta) {
          const { id_cuenta, token_cuenta, correo_cuenta, usuario_cuenta } = response.data;

          login({ id_cuenta, token_cuenta, userName: usuario_cuenta, correo_cuenta }); 
          setExito(true);
          setError('');
          navigate('/');
        } else {
          setError('Credenciales inválidas');
        }
      } else {
        setError('No se encontró un usuario con ese rut');
      }
    } catch (error) {
      console.error('Error en la llamada a la API:', error);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
    console.log(currentUser);
  };

  return (
    <section className='section-login'>
      <form-login>
        <h1>Iniciar Sesión</h1>
        <form id='login-container' onSubmit={handleSubmit}>
          {exito && (
            <Alert variant="success" onClose={() => setExito(false)} dismissible>
              Inicio de sesión exitoso.
            </Alert>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <p>Rut del paciente</p>
          <p className="small-text">(Sin puntos ni guion)</p>
          <input
            type="text"
            id='rut'
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
          <p>Contraseña</p>
          <input
            type="password"
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='btn-cesfam' type='submit'>
            Iniciar Sesión
          </button>
        </form>
        <nav>
          <p>
            ¿No tienes una cuenta? <Link to="/registrar">Regístrate</Link>
          </p>
        </nav>
      </form-login>
    </section>
  );
};

export default Login;
