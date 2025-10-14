import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const saveToken = t => { localStorage.setItem('token', t); setToken(t); };
  return <AuthContext.Provider value={{ token, saveToken }}>{children}</AuthContext.Provider>;
};
