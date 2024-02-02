import '../styles/index.css';
import evento from '../assets/img/evento.png';
import evento2 from '../assets/img/evento_2.png';
import iconoAgendar from '../assets/img/iconoAgendar.png';
import iconoReceta from '../assets/img/iconoReceta.png';
import '../styles/index.css'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../layout/AuthContext';


function Index() {
  const [eventos, setEventos] = useState([]);
  const { currentUser } = useAuth();
  console.log('currentUser:', currentUser);
  useEffect(() => {
    
    const obtenerEventos = async () => {
      try {
        const respuesta = await fetch('http://localhost:3001/api/obtenerEventos');
        const data = await respuesta.json();
        setEventos(data);
      } catch (error) {
        console.error("Error al obtener los eventos:", error);
      }
    };
    obtenerEventos();
  }, []);

  const eventosDisponibles = eventos.filter((evento) => evento.cupos_disponible_evento > 0);

  return (
    <>
      <main>
        
        <section className='carrousel-section'>
        <h2 id='title'>Proximos Eventos y Talleres!</h2>
          <div id="carouselExampleCaptions" className="carousel">
            <div className="carousel-indicators">
              {eventosDisponibles.length > 0 &&
                eventosDisponibles.map((evento, index) => (
                  <button
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-label={`Slide ${index + 1}`}
                    aria-current={index === 0 ? "true" : undefined}
                    key={index}
                  ></button>
                ))}
            </div>

            <div className="carousel-inner">
              {eventosDisponibles.length > 0 ? (
                eventosDisponibles.map((evento, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                    key={index}
                  >
                    <Link to={`/eventos/${evento.id_evento}`}>
                      <img
                        src={evento.imagen_evento || evento2}
                        className="d-block"
                        style={{ transition: '0s' }}
                        alt="Evento"
                      />
                    </Link>
                    <div className="carousel-caption d-none d-md-block">
                      <h2>{evento.nombre_evento || "No se encuentra"}</h2>
                      <p>Presione la imagen para inscribirse al evento</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`carousel-item active`}>
                  <a href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP0jyNJJdnFAfic0na1S7KikOXN9sWlpgzQg&usqp=CAU">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP0jyNJJdnFAfic0na1S7KikOXN9sWlpgzQg&usqp=CAU"
                      className="d-block"
                      style={{ transition: '0s' }}
                      alt="No hay eventos disponibles"
                    />
                  </a>
                  <div className="carousel-caption d-none d-md-block">
                    <h2>No hay eventos disponibles</h2>
                    <p>Lo sentimos, no hay eventos disponibles en este momento.</p>
                  </div>
                </div>
              )}
            </div>

            {eventosDisponibles.length > 0 && (
              <div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden={true}></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden={true}></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            )}
          </div>
        </section>

        <section className='section-services'>
          <h2 id='title'>Nuestros Servicios</h2>
          <div className="services">
            <Link to={'/Area'} className="service-card">
              <div className="service-info">
                <img src={iconoAgendar} alt="" />
                <p>Agendar Hora</p>
              </div>
            </Link>

            <Link to={'/Receta'} className="service-card">
              <div className="service-info">
                <img src={iconoReceta} alt="" />
                <p>Ver Receta Medica</p>
              </div>
            </Link>
          </div>
        </section>

        <section className='section-info'>
          <div className="cesfam-info">
            <div className="ubication">
              <h3>Donde nos ubicamos?</h3>
              <iframe
                className="mapa"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.7467683690397!2d-70.5808420243045!3d-33.55995517334625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662d0d443ac02d9%3A0x9b0eccb7c381ab78!2sCESFAM%20Maffioletti!5e0!3m2!1ses!2scl!4v1693696027800!5m2!1ses!2scl"
                width="600"
                height="450"
                style={{ border: '0' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="contact">
              <h3>Mas informacion</h3>
              <ul>
                <li>Correo: oirsmaffioletti@gmail.com</li>
                <li>Telefono: 226112952</li>
                <li className="horario">Horario</li>
                <li>Lunes a jueves: 8:00 a 17:30 hrs</li>
                <li>Viernes: 8:00 a 16:30 hrs.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Index;
