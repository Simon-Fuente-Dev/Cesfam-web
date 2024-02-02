import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import jsPDF from 'jspdf';
import logoCesfam2 from '../assets/img/logoCesfam2.png';
import emailjs from 'emailjs-com';
import { useAuth } from '../layout/AuthContext';

const MySwal = withReactContent(Swal);

const DetalleReceta = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { idReceta, area } = state || {};
  const [medicamentos, setMedicamentos] = useState([]);
  const [descripcionReceta, setDescripcionReceta] = useState("");
  const [boletaValidada, setBoletaValidada] = useState(null);
  const [idBoleta, setIdBoleta] = useState("");
  const { currentUser } = useAuth();

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

  useEffect(() => {
    const obtenerMedicamentos = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/api/obtenerMedicamentosReceta/${idReceta}`);
        if (data && data.length > 0) {
          setDescripcionReceta(data[0].descripcion_receta);
          setMedicamentos(data.map(medicamento => ({
            nombre: medicamento.nombre_medicamento,
            cantidad: medicamento.cantidad,
            descripcion: medicamento.descripcion_medicamento
          })));
        }
      } catch (error) {
        console.error('Error al obtener los medicamentos de la receta:', error);
      }
    };


    const validarBoleta = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/obtenerBoleta/${idReceta}`);
        const boletaId = response.data.id_boleta;
        setBoletaValidada(true);
        setIdBoleta(boletaId); 
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setBoletaValidada(false);
        } else {
          console.error('Error al validar la boleta:', error);
        }
      }
    };
  
    if (idReceta) {
      obtenerMedicamentos();
      validarBoleta();
    }
  }, [idReceta]);

  const validarYCrearBoleta = async () => {
    try {
      await axios.post('http://localhost:3001/api/validarRecetaYCrearBoleta', { idReceta });
      
      MySwal.fire({
        title: 'Boleta validada y creada exitosamente',
        icon: 'success',
        timer: 3000,
      });
      setBoletaValidada(true);
    } catch (error) {
      console.error('Error al validar la receta y crear la boleta:', error);
      let errorMessage = 'Hubo un error al validar la receta y crear la boleta. Por favor, intente nuevamente.';
      if (error.response && error.response.data && error.response.data.error) {
        
        const errorText = error.response.data.error;
        const match = errorText.match(/No hay suficiente stock para el medicamento: (.+)/);
        if (match && match[1]) {
          errorMessage = `No hay suficiente stock para el/los medicamento/s.`;
        }
      }
      MySwal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        timer: 3000,
      });
      setBoletaValidada(false);
    }
  };
  

  const solicitarMedic = async (e) => {

    try {
      const response = await axios.get(`http://localhost:3001/api/obtenerBoleta/${idReceta}`);
      const boletaId = response.data.id_boleta;

      e.preventDefault();
    const hayMedic = medicamentos.length > 0;
    if (hayMedic && boletaId) {
      const numeroBoleta = boletaId;
      const doc = new jsPDF();
      doc.setFont('Arial');
      doc.setFontSize(25);

      doc.addImage(logoCesfam2, 'JPEG', 10, 10, 200, 100)
      doc.text('Boleta solicitud de medicamentos cesfam', 20, 130)
      doc.text('Su numero de boleta es: ' + numeroBoleta, 20, 150);
      doc.text('----------------------------------------------', 20, 170);
      doc.text('Medicamentos solicitados:', 20, 190);
      doc.text('----------------------------------------------', 20, 210);

      const x = 20;
      let y = 230;

      medicamentos.forEach((item) => {
        let textoMedicamento = `Nombre: ${item.nombre} | Cantidad: ${item.cantidad} `;
        doc.text(textoMedicamento, x, y);
        y += 20;
      });
      
      try {
        const response = await MySwal.fire({
          titleText: 'Medicamentos solicitados con exito',
          icon: 'success',
          html: `Su numero de boleta es ${numeroBoleta} <br>Presione el boton para descargar su boleta`,
          confirmButtonText: 'Descargar boleta'
        });

        if (response.isConfirmed) {
          doc.save(`BoletaMedicamentos${numeroBoleta}.pdf`);
          MySwal.fire({
            titleText: "Boleta descargada con exito",
            icon: 'success',
            text: 'Revise su carpeta de descargas'
          });

          await emailjs.send("service_9caz3ty", "template_40ek8tb", {
            nom_paciente: currentUser.userName,
            numero_boleta: numeroBoleta,
            user_email: currentUser.correo_cuenta
          }, 'kqxltPzfZim80IcOt');
          console.log("Correo enviado con éxito");
        }
      } catch (error) {
        console.error("Error al solicitar medicamentos o enviar correo", error);
        MySwal.fire({
          titleText: "Error",
          icon: 'error',
          text: 'Hubo un error al solicitar los medicamentos o enviar el correo. Por favor, intente nuevamente.'
        });
      }
    } else {
      MySwal.fire({
        titleText: "No hay medicamentos disponibles",
        icon: 'error',
        text: 'Actualmente no hay medicamentos disponibles para solicitar.'
      });
    }



    } catch (error) {
      if (error.response && error.response.status === 404) {
        setBoletaValidada(false);
      } else {
        console.error('Error al validar la boleta:', error);
      }
    }

    
  };

  return (
    <section>
      <div className='receta-info'>
        <h1>Receta {area}</h1>
        <div className='desc-receta'>
          <h2>Descripción de la receta:</h2>
          <p>{descripcionReceta}</p>
        </div>
        <div className="medic-receta">
          <h2>Medicamentos:</h2>
          <ul>
            {medicamentos.map((medicamento, index) => (
              <li key={index}>Nombre: {medicamento.nombre} | Descripción: {medicamento.descripcion} | Cantidad: {medicamento.cantidad}</li>
            ))}
          </ul>
   
        </div>
        <div className="solicitar">
        <button className='btn-solicitar' onClick={validarYCrearBoleta} disabled={boletaValidada !== false}>Validar Boleta</button>
        </div>
        <div className="solicitar">
          <button className='btn-solicitar' onClick={solicitarMedic} disabled={!boletaValidada}>Solicitar medicamentos</button>
        </div>

      </div>
    </section>
  );
};

export default DetalleReceta;
