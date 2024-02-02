import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Registrar.css';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../layout/AuthContext';

const Registrar = () => {
  const [rut, setRut] = useState('');
  const [dv, setDv] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState('');
  const [camposFaltantes, setCamposFaltantes] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    navigate('/');
  }

  const isRutValid = (rut) => /^\d{8}$/.test(rut);
  const isDvValid = (dv) => dv.length === 1;
  const isNombreValid = (nombre) => /^[A-Za-z ]+$/.test(nombre);
  const isCorreoValid = (correo) => correo.includes('@');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposFaltantes = [];

    if (!isRutValid(rut)) {
      camposFaltantes.push('Rut debe tener 8 números.');
    }

    if (!isDvValid(dv)) {
      camposFaltantes.push('Dígito Verificador debe ser un solo carácter.');
    }

    if (!isNombreValid(nombre)) {
      camposFaltantes.push('Nombre debe contener solo letras (ningún número).');
    }

    if (!isNombreValid(apellido)) {
      camposFaltantes.push('Apellido debe contener solo letras (ningún número).');
    }

    if (!isCorreoValid(correo)) {
      camposFaltantes.push('Correo debe contener al menos un @.');
    }

    if (!usuario) {
      camposFaltantes.push('Por favor, ingresa un usuario.');
    }

    if (!password) {
      camposFaltantes.push('Por favor, ingresa una contraseña.');
    }

    if (!confirmPass) {
      camposFaltantes.push('Por favor, confirma tu contraseña.');
    }

    if (camposFaltantes.length > 0) {
      setError('Por favor, corrige los siguientes campos:');
      setCamposFaltantes(camposFaltantes);
      return;
    }

    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden');
      setCamposFaltantes([]);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/InsertarCuentaPersona_web', {
        p_usuario: usuario,
        p_contrasenia: password,
        p_rut: parseInt(rut, 10),
        p_dv: dv,
        p_nombre: nombre,
        p_apellido: apellido,
        p_correo: correo,
        p_token: null
      });

      if (response.status === 200) {
        setRegistroExitoso(true);
        setError('');
        setCamposFaltantes([]);

        setUsuario('');
        setPassword('');
        setConfirmPass('');
        setRut('');
        setDv('');
        setNombre('');
        setApellido('');
        setCorreo('');

        setTimeout(() => {
          setRegistroExitoso(false);
          navigate('/login');
        }, 5000);
      } else if (response.status === 401) {
        setError('La cuenta ya se encuentra registrada.');
      } else {
        console.error('Error al registrar.');
        setError('Error al registrar.');
      }
    } catch (error) {
      console.error('Error en la llamada a la API:', error);
      setError('Error al insertar el registro. Verifica los campos faltantes.');
    }
  };

  return (
    <section className='section-registrar'>
      <div className="registrar">
        <h1>Registrarse</h1>
        {registroExitoso && (
          <Alert variant="success" onClose={() => setRegistroExitoso(false)} dismissible>
            Registro insertado exitosamente.
          </Alert>
        )}
        {error && (
          <Alert variant="danger">
            {error}
            {camposFaltantes.length > 0 && (
              <ul>
                {camposFaltantes.map((campo, index) => (
                  <li key={index}>{campo}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-registrar">
            <div className="datos-persona">
              <div className="form-group">
                <label>Rut del paciente</label>
                <p className="small-text-registrar">(Sin puntos)</p>
                <div className="rutPaciente">
                  <input
                    id='rut-registrar'
                    type="number"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                  />
                  <p className='dv-rut'>-</p>
                  <input
                    id='dv-registrar'
                    type="text"
                    value={dv}
                    onChange={(e) => setDv(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
            </div>
            <div className="datos-usuario">
              <div className="form-group">
                <label>Correo</label>
                <p className="small-text-registrar">(Ej: correo@gmail.com)</p>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Usuario</label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button className='btn-cesfam' type='submit'>Registrarse</button>
        </form>
        <nav>
          <p>¿Ya tienes una cuenta? <Link to='/login'>Inicia Sesión!</Link></p>
        </nav>
      </div>
    </section>
  );
}

export default Registrar;
