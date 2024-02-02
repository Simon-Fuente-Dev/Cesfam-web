import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../layout/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Receta = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dia, setDia] = useState('');
  const [recetas, setRecetas] = useState([]);
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [horas, setHoras] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      MySwal.fire({
        title: 'Por favor inicia sesión para acceder a esta página',
        icon: 'info',
        timer: 3000,
      }).then(() => {
        navigate('/');
      });
    }
  }, [currentUser, navigate]);


  const isWithinRange = (value, min, max) => {
    return value >= min && value <= max;
  };


  const isValidTwoDigitNumber = (value) => {
    return /^\d{2}$/.test(value);
  };

  useEffect(() => {
    if (dia && mes && anio && currentUser && dia.length === 2 && mes.length === 2 && anio.length === 4) {
      obtenerHoras();
    }
  }, [dia, mes, anio, currentUser]);

  useEffect(() => {
    obtenerReceta();
  }, [horaSeleccionada]);

  const verDetalle = (receta) => {
    console.log('Navegando a DetalleReceta con idReceta:', receta.id_receta, 'y área:', receta.area);
    navigate(`/Detalle/${receta.id_receta}`, { state: { idReceta: receta.id_receta, area: receta.area } });
  };

  const formatHora = (hora) => {
    const horas = Math.floor(hora / 100);
    const minutos = hora % 100;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  const obtenerHoras = async () => {
    if (!isWithinRange(parseInt(dia), 1, 31) || !isWithinRange(parseInt(mes), 1, 12)) {
      MySwal.fire({
        title: 'Fecha no válida',
        icon: 'error',
        text: 'Por favor, ingrese una fecha válida.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/obtenerHoraReceta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dia: parseInt(dia),
          mes: parseInt(mes),
          anio: parseInt(anio),
          id_cuenta: currentUser.id_cuenta,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal');
      }
      if (data.length === 0) {
        MySwal.fire({
          title: 'No se encontraron horas disponibles',
          icon: 'info',
          text: 'No hay horas disponibles para la fecha seleccionada.',
        });
      } else {
        setHoras(data.map((hora) => ({
          id: hora.id_hora,
          hora: formatHora(hora.hora_hora),
        })));
      }
      setBusquedaRealizada(true);
    } catch (error) {
      console.error('Error al obtener las horas:', error);
    }
  };

  const obtenerReceta = async () => {
    try {
      if (horaSeleccionada) {
        const response = await fetch(`http://localhost:3001/api/obtenerreceta/${horaSeleccionada}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw Error(data.error || 'Algo salió mal');
        }
        setRecetas(data);
        setBusquedaRealizada(true);
        if (data.length === 0) {
          MySwal.fire({
            title: 'No se encontraron recetas disponibles',
            icon: 'info',
            text: 'No hay recetas disponibles para la hora y fecha seleccionadas.',
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener la receta:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      isValidTwoDigitNumber(dia) &&
      isValidTwoDigitNumber(mes) &&
      anio.length === 4 &&
      isWithinRange(parseInt(dia), 1, 31) &&
      isWithinRange(parseInt(mes), 1, 12)
    ) {
      obtenerHoras();
    } else {
      MySwal.fire({
        title: 'Fecha no válida',
        icon: 'error',
        text: 'Por favor, ingrese una fecha válida.',
      });
    }
  };

  return (
    <section className='section-receta'>
      <h1>Seleccione una hora para ver su receta médica</h1>
      <h2>Ingrese la fecha de su cita</h2>
      <form className='form-fecha' onSubmit={handleSubmit}>
        <div className="fecha-receta">
          <p>Dia:</p>
          <input type='number' value={dia} onChange={(e) => setDia(e.target.value)}></input>
          <p>Mes:</p>
          <input type='number' value={mes} onChange={(e) => setMes(e.target.value)}></input>
          <p>Año:</p>
          <input type='number' value={anio} onChange={(e) => setAnio(e.target.value)}></input>
        </div>
      </form>
      <form className="area" onSubmit={handleSubmit}>
        <select value={horaSeleccionada} onChange={(e) => setHoraSeleccionada(e.target.value)}>
          <option value="">Seleccione una hora...</option>
          {horas.map((hora) => (
            <option key={hora.id} value={hora.id}>
              {hora.hora}
            </option>
          ))}
        </select>
      </form>

      {recetas.length > 0 ? (
        <div className="recetas-container">
          {recetas.map((receta) => (
            <div key={receta.id_receta} className="receta-card">
              <div className="card-info">
                <p>Receta: {receta.area}</p>
                <p>Hora: {formatHora(receta.hora)}</p>
                <p>Nombre: {receta.nombre}</p>
                <button onClick={() => verDetalle(receta)}>Ver Receta</button>
              </div>
            </div>
          ))}
        </div>
      ) : busquedaRealizada && (
        <p>No hay recetas para mostrar</p>
      )}
    </section>
  );
};

export default Receta;
