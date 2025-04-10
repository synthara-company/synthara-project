import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import ExternalLinkModal from '../components/ExternalLinkModal';

// Create context
const ExternalLinkContext = createContext();

// Provider component
export const ExternalLinkProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    url: '',
    title: ''
  });

  const openExternalLink = (url, title) => {
    // Handle special protocols like mailto: directly
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      window.location.href = url;
      return;
    }

    setModalState({
      isOpen: true,
      url,
      title: title || getLinkTitle(url)
    });
  };

  const closeExternalLink = () => {
    setModalState({
      ...modalState,
      isOpen: false
    });
  };

  // Helper function to extract a title from the URL
  const getLinkTitle = (url) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      // Extract site name from domain
      if (domain.includes('vercel.app')) {
        // For vercel apps, use the subdomain
        const subdomain = domain.split('.')[0];
        return subdomain.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }

      // For other domains, use the domain name
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch (error) {
      return 'External Website';
    }
  };

  return (
    <ExternalLinkContext.Provider value={{ openExternalLink, closeExternalLink }}>
      {children}
      <ExternalLinkModal
        url={modalState.url}
        isOpen={modalState.isOpen}
        onClose={closeExternalLink}
        title={modalState.title}
      />
    </ExternalLinkContext.Provider>
  );
};

ExternalLinkProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the external link context
export const useExternalLink = () => {
  const context = useContext(ExternalLinkContext);
  if (!context) {
    throw new Error('useExternalLink must be used within an ExternalLinkProvider');
  }
  return context;
};
