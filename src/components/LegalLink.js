import React from 'react';
import PropTypes from 'prop-types';
import { useLegal } from '../contexts/LegalContext';

const LegalLink = ({ type, children, className, ...props }) => {
  const { openLegalModal } = useLegal();

  const handleClick = (e) => {
    e.preventDefault();
    openLegalModal(type);
  };

  return (
    <a
      href={`/${type}`}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

LegalLink.propTypes = {
  type: PropTypes.oneOf(['privacy', 'terms', 'legal', 'ai-policy']).isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default LegalLink;
