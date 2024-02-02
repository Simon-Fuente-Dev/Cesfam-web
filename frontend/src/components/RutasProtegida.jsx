// RutasProtegidas.js
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../layout/AuthContext';
import Index from '../paginas/Index';
import Login from '../paginas/Login';
import Registrar from '../paginas/Registrar';

const RutasProtegidas = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate(); 
  
    if (currentUser) {
      navigate('/'); 
    }
  
    return (
      <Routes>
        <Route path="/" element={<Index />} />
  

        {!currentUser ? <Route path="/login" element={<Login />} /> : null}
  

        {!currentUser ? <Route path="/registro" element={<Registrar />} /> : null}
      </Routes>
    );
  };
export default RutasProtegidas;
