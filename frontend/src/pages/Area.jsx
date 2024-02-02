import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../layout/AuthContext'; 

const MySwal = withReactContent(Swal);

const Area = () => {
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState([]);
  const navigate = useNavigate();
  const auth = useAuth(); 

  useEffect(() => {
    
    if (!auth.currentUser) {
      MySwal.fire({
        title: 'Por favor iniciar sesión para acceder a esta información',
        icon: 'info',
        timer: 3000, 
      }).then(() => {
        navigate('/'); 
      });
      return;
    }

    fetch('http://localhost:3001/api/carga_cb_area')
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          MySwal.fire({
            title: 'No hay áreas disponibles por el momento',
            icon: 'info',
            button: 'OK',
          }).then(() => {
            navigate('/'); 
          });
        } else {
          console.log('Áreas cargadas:', data);
          setAreas(data);
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos del área:', error);
        MySwal.fire({
          title: 'Error al obtener datos del área',
          icon: 'error',
          button: 'Aceptar',
        });
      });
  }, [auth.currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (area === '') {
      MySwal.fire({
        title: 'Debe seleccionar un área',
        icon: 'error',
        button: 'Aceptar',
      });
      return;
    }

    console.log('Área seleccionada:', area);
    const selectedArea = areas.find((areaItem) => String(areaItem.id_area) === String(area));
    console.log('Área seleccionada (objeto):', selectedArea);

    if (!selectedArea) {
      console.error('No se pudo encontrar la descripción para el área seleccionada');
      MySwal.fire({
        title: 'Error',
        text: 'No se pudo encontrar la descripción para el área seleccionada',
        icon: 'error',
        button: 'Aceptar',
      });
      return;
    }

    const descripcionArea = selectedArea.descripcion_area;
    console.log('Descripción Área antes de navegar:', descripcionArea);

    try {
      navigate('/Hora', { state: { id_area: area, descripcion_area: descripcionArea } });
    } catch (error) {
      console.error('Error al redirigir a la página Hora:', error);
    }
  };

  return (
    <section className="section-area">
      <form className="area" onSubmit={handleSubmit}>
        <h1>Seleccione un área para su consulta</h1>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Seleccione un Área...</option>
          {areas.map((areaItem) => (
            <option key={areaItem.id_area} value={areaItem.id_area}>
              {areaItem.descripcion_area}
            </option>
          ))}
        </select>
        <button type="submit">Siguiente</button>
      </form>
    </section>
  );
};

export default Area;
