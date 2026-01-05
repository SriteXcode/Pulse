import React, { createContext, useContext, useState, useCallback } from 'react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within a AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null); // 'login', 'register', or null

  const openLogin = useCallback(() => setActiveModal('login'), []);
  const openRegister = useCallback(() => setActiveModal('register'), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister, closeModal }}>
      {children}
      <LoginModal 
        isOpen={activeModal === 'login'} 
        onClose={closeModal} 
        switchToRegister={openRegister}
      />
      <RegisterModal 
        isOpen={activeModal === 'register'} 
        onClose={closeModal} 
        switchToLogin={openLogin}
      />
    </AuthModalContext.Provider>
  );
};
