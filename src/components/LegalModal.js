import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import PrivacyPolicy from '../PrivacyPolicy';
import TermsOfService from '../TermsOfService';
import CompanyLegal from './CompanyLegal';
import AIUsagePolicy from '../AIUsagePolicy';

const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (type) {
      case 'privacy':
        return <PrivacyPolicy displayMode={window.displayMode} />;
      case 'terms':
        return <TermsOfService displayMode={window.displayMode} />;
      case 'legal':
        return <CompanyLegal displayMode={window.displayMode} />;
      case 'ai-policy':
        return <AIUsagePolicy displayMode={window.displayMode} />;
      default:
        return <div>Content not found</div>;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'privacy':
        return 'Privacy';
      case 'terms':
        return 'Terms';
      case 'legal':
        return 'Legal';
      case 'ai-policy':
        return 'AI Policy';
      default:
        return 'Information';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] w-[95%] h-[90%] max-w-4xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3">
          <p className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">{getTitle()}</p>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-grow overflow-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

LegalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['privacy', 'terms', 'legal', 'ai-policy']).isRequired
};

export default LegalModal;
