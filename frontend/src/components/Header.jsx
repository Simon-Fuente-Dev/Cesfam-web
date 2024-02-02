import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import homeIcon from '../assets/img/home-2.svg';
import agendarIcon from '../assets/img/calendar-due.svg';
import recetaIcon from '../assets/img/pill.svg';
import menuIcon from '../assets/img/menu-2.svg';
import { useAuth } from '../layout/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const [ check, setCheck] = useState(false);

    useEffect(() => {
        const menuLateral = document.getElementById('menuLateral');
        const menuButton = document.getElementById('menuButton');

        menuButton.addEventListener('click', function () {
            setCheck(!check);
            if (check) {
                menuLateral.classList.add('displayBlock');
            } else {
                menuLateral.classList.remove('displayBlock');
            }
        });
    }, [check]);

    return (
        <>
            <header>
                <div className="header">
                    <div className="funciones-header">
                        <div className="menu">
                            <img src={menuIcon} alt="" id='menuButton' />
                        </div>

                        <Link className='funcion-header' to="/">
                            <img src={homeIcon} alt="" />
                            <p>Volver al inicio</p>
                        </Link>
                        <Link className='funcion-header' to="/Area">
                            <img src={agendarIcon} alt="" />
                            <p>Agendar Hora</p>
                        </Link>
                        <Link className='funcion-header' to="/Receta">
                            <img src={recetaIcon} alt="" />
                            <p>Solicitar medicamentos</p>
                        </Link>
                    </div>

                    <div className="login">
                        {currentUser ? (
                            <>
                                <p className=''>Bienvenido, {currentUser.userName}</p>
                                <a className='' onClick={logout}>Cerrar sesión</a>
                            </>
                        ) : (
                            <>
                                <Link className='header-text' to="/login">
                                    <p>Iniciar Sesión</p>
                                </Link>
                                <Link className='header-text' to="/Registrar">
                                    <p>Registrarse</p>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <div id="menuLateral" className='menuLateral'>
                <Link className='funcion-menu' to="/">
                    <img src={homeIcon} alt="" />
                    <p>Volver al inicio</p>
                </Link>
                <Link className='funcion-menu' to="/Area">
                    <img src={agendarIcon} alt="" />
                    <p>Agendar Hora</p>
                </Link>
                <Link className='funcion-menu' to="/Receta">
                    <img src={recetaIcon} alt="" />
                    <p>Solicitar medicamentos</p>
                </Link>
            </div>
        </>
    )
}

export default Header;
