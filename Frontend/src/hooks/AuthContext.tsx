import React, { createContext, useContext, useEffect, useState } from 'react';
import {signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../Database/FirebaseConfig";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;

};