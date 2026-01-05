import React, { createContext, useContext, useState, useCallback } from 'react';
import Popup from '../components/Popup';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    onConfirm: () => {},
    onClose: () => {},
  });

  const showAlert = useCallback((message, onClose = () => {}) => {
    setModalState({
      isOpen: true,
      message,
      type: 'alert',
      onConfirm: () => {},
      onClose: () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        onClose();
      },
    });
  }, []);

  const showConfirm = useCallback((message, onConfirm = () => {}, onClose = () => {}) => {
    setModalState({
      isOpen: true,
      message,
      type: 'confirm',
      onConfirm: () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onClose: () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        onClose();
      },
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      <Popup
        isOpen={modalState.isOpen}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onClose={modalState.onClose}
      />
    </ModalContext.Provider>
  );
};
