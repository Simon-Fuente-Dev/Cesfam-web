import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import emailjs from 'emailjs-com';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../layout/AuthContext';

const MySwal = withReactContent(Swal);

const Hora = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [especialista, setEspecialista] = useState('');
  const [fecha, setFecha] = useState('');
  const [selectedHourId, setSelectedHourId] = useState(null);
  const [hora, setHora] = useState('');
  const [habilitado, setHabilitado] = useState(true);
  const [especialistasList, setEspecialistasList] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horasParaFecha, setHorasParaFecha] = useState([]);

  const location = useLocation();
  const id_area = location.state ? location.state.id_area : '';
  const descripcion_Area = location.state ? location.state.descripcion_area : '';
  console.log('ID Área:', id_area);
  console.log('Descripción Área:', descripcion_Area);
  console.log('currentUser:', currentUser);

  useEffect(() => {
    if (!currentUser) {
      MySwal.fire({
        title: 'Por favor iniciar sesión para acceder a esta información',
        icon: 'info',
        timer: 3000, 
      }).then(() => {
        navigate('/');
      });
    } else if (!id_area) {
      MySwal.fire({
        title: 'Debe seleccionar un área primero',
        icon: 'info',
        timer: 3000, 
      }).then(() => {
        navigate('/Area');
      });
    } else {
      obtenerEspecialistas(id_area);
    }
  }, [id_area, currentUser]);


  useEffect(() => {
    if (id_area) {
      obtenerEspecialistas(id_area);
    }
  }, [id_area]);

  const selectEspecialista = (e) => {
    e.preventDefault();
    const especialistaSeleccionado = e.target.value;
    setEspecialista(especialistaSeleccionado);

    if (especialistaSeleccionado === '') {
      MySwal.fire({
        title: 'Debe seleccionar un especialista',
        icon: 'error',
      });
      setHabilitado(true);
      setFecha('');
      setHorasDisponibles([]);
      setFechasDisponibles([]);
    } else {
      setHabilitado(false);
      obtenerHorasDisponibles(especialistaSeleccionado);
    }
  };

  const obtenerEspecialistas = (idArea) => {
    fetch(`http://localhost:3001/api/obtenerUsuariosPorArea/${idArea}`)
      .then((response) => response.json())
      .then((data) => {
        setEspecialistasList(data);
      })
      .catch((error) => {
        console.error('Error al obtener especialistas por área:', error);
        MySwal.fire({
          title: 'Error al obtener especialistas por área',
          icon: 'error',
          button: 'Aceptar',
        });
      });
  };
  const obtenerHorasDisponibles = (rutEspecialista) => {
    fetch(`http://localhost:3001/api/horasPorEspecialista/${rutEspecialista}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Data recibida: ', data);  
        const formattedHoras = data.map((hora) => {
          const horas_disponibles = hora.horas_disponibles ? hora.horas_disponibles.split(', ') : [];
          const ids_hora = hora.ids_hora ? hora.ids_hora.split(', ') : [];
          return {
            fecha: hora.fecha,
            horas_disponibles,
            ids_hora,
          };
        });
        console.log('Formatted Horas: ', formattedHoras);  
        setHorasDisponibles(formattedHoras);
        setFechasDisponibles([...new Set(formattedHoras.map((hora) => hora.fecha))]);
      })
      .catch((error) => {
        console.error('Error al obtener las horas del especialista:', error);
        MySwal.fire({
          title: 'Error al obtener las horas del especialista',
          icon: 'error',
          button: 'Aceptar',
        });
      });
  };



  function formatDate(dateString) {
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }



  const seleccionarFecha = (e) => {
    const fechaSeleccionada = e.target.value;
    setFecha(fechaSeleccionada);


    const horasFecha = horasDisponibles.filter((hora) => hora.fecha === fechaSeleccionada);
    setHorasParaFecha(horasFecha);
  };

  const seleccionarHora = (e) => {
    e.preventDefault();
    const horaSeleccionada = e.currentTarget.getAttribute('data-value');
    const idHoraSeleccionada = e.currentTarget.getAttribute('data-id');
    console.log('variable id_hora', idHoraSeleccionada);

    MySwal.fire({
      title: `¿Desea agendar la hora de las ${horaSeleccionada}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {


        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_hora: idHoraSeleccionada,
            id_cuenta: currentUser.id_cuenta 
          })
        };

        fetch('http://localhost:3001/api/reservarHora', requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              MySwal.fire({
                title: data.message,
                icon: 'success',
              });
            } else {
              throw new Error(data.error || 'Error al reservar la hora');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            MySwal.fire({
              title: error.message,
              icon: 'error',
            });
          });

        const especialistasFiltrados = especialistasList.filter((esp) => String(esp.rut_persona_cuenta) === String(especialista));
        const especialistaSeleccionado = especialistasFiltrados.length > 0 ? especialistasFiltrados[0] : null;

        if (especialistaSeleccionado) {
          emailjs.send('service_9caz3ty', 'template_mvs6qqb', {
            nom_paciente: currentUser.userName,
            area: descripcion_Area,
            dia_hora: formatDate(fecha),
            hora: horaSeleccionada,
            nom_especialista: especialistaSeleccionado.nombre_completo,
            user_email: currentUser.correo_cuenta,
          }, 'kqxltPzfZim80IcOt')
            .then((response) => {
              console.log('Correo enviado con éxito', response);
              MySwal.fire({
                title: 'Hora agendada con éxito!',
                text: 'Revise su correo con los detalles de la hora',
                icon: 'success',
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate('/Area');
                }
              });
            })
            .catch((error) => {
              console.error('Error al enviar el correo', error);
              MySwal.fire({
                title: 'Error al agendar la hora',
                text: 'No se pudo enviar el correo de confirmación',
                icon: 'error',
              });
            });
        } else {
          console.log('Especialista no encontrado');
          MySwal.fire({
            title: 'Error al agendar la hora',
            text: 'No se pudo encontrar la información del especialista',
            icon: 'error',
          });
        }
      }
    });
  };

  return (
    <section className="section-hora">
      <div className="agendar">
        <div className="especialista">
          <h2>Seleccione un especialista con el que desee atenderse</h2>
          <select value={especialista} onChange={selectEspecialista}>
            <option value="">Seleccione un Especialista..</option>
            {especialistasList.map((especialista) => (
              <option key={especialista.rut_persona_cuenta} value={especialista.rut_persona_cuenta}>
                {especialista.nombre_completo}
              </option>
            ))}
          </select>
        </div>
        <div className="fecha">
          <h2>Elija una fecha para su hora</h2>
          <select disabled={habilitado} value={fecha} onChange={seleccionarFecha}>
            <option value="">Seleccione una fecha..</option>
            {fechasDisponibles.map((fechaDisponible, index) => (
              <option key={index} value={fechaDisponible}>
                {formatDate(fechaDisponible)}
              </option>
            ))}
          </select>
        </div>
        <div className="hora">
          <h2>Elija una hora para agendar</h2>
          <div className="horas">
            {horasParaFecha.map((horaDisponible, index) => (
              console.log('horaDisponible.ids_hora:', horaDisponible.ids_hora),
              console.log('horaDisponible.horas_disponibles:', horaDisponible.horas_disponibles),
              horaDisponible.horas_disponibles.map((hora, horaIndex) => (
                <div
                  className="hora-card"
                  onClick={seleccionarHora}
                  data-value={hora}
                  data-id={horaDisponible.ids_hora[horaIndex]}
                  key={horaIndex}
                >
                  <p>{hora}</p>
                </div>
              ))
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hora;
