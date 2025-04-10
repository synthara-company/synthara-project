import React from 'react';
import PropTypes from 'prop-types';
import { useExternalLink } from '../contexts/ExternalLinkContext';

const ExternalLink = ({ href, children, className, title, ...props }) => {
  const { openExternalLink } = useExternalLink();

  const handleClick = (e) => {
    e.preventDefault();
    openExternalLink(href, title);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string
};

export default ExternalLink;
