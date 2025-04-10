import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import LegalModal from '../components/LegalModal';

// Create context
const LegalContext = createContext();

// Provider component
export const LegalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'privacy'
  });

  const openLegalModal = (type) => {
    setModalState({
      isOpen: true,
      type
    });
  };

  const closeLegalModal = () => {
    setModalState({
      ...modalState,
      isOpen: false
    });
  };

  return (
    <LegalContext.Provider value={{ openLegalModal, closeLegalModal }}>
      {children}
      <LegalModal
        isOpen={modalState.isOpen}
        onClose={closeLegalModal}
        type={modalState.type}
      />
    </LegalContext.Provider>
  );
};

LegalProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the legal context
export const useLegal = () => {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
};
