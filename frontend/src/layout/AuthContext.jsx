import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');
    const idCuenta = localStorage.getItem('idCuenta');
    const correoCuenta = localStorage.getItem('correoCuenta'); 

    if (userToken) {
      console.log("Estableciendo currentUser en AuthContext");
      setCurrentUser({
        token_cuenta: userToken,
        userName,
        id_cuenta: idCuenta,
        correo_cuenta: correoCuenta, 
      });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('idCuenta');
    localStorage.removeItem('correoCuenta');
    setCurrentUser(null);
  };

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userName', userData.userName);
    localStorage.setItem('idCuenta', userData.id_cuenta);
    localStorage.setItem('correoCuenta', userData.correo_cuenta); 
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
