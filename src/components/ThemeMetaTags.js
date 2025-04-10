import React from 'react';
import { Helmet } from 'react-helmet';

const ThemeMetaTags = ({ displayMode }) => {
  // Determine which OG card to use based on the current theme
  const getOgCardPath = () => {
    switch (displayMode) {
      case 'dark':
        return '/og-card-dark.svg';
      case 'gold':
        return '/og-card-gold.svg';
      case 'blue':
        return '/og-card-blue.svg';
      case 'dim':
        return '/og-card-dark.svg';
      default:
        return '/og-card-light.svg';
    }
  };

  return (
    <Helmet>
      <meta property="og:image" content={`${window.location.origin}${getOgCardPath()}`} />
      <meta property="twitter:image" content={`${window.location.origin}${getOgCardPath()}`} />
    </Helmet>
  );
};

export default ThemeMetaTags;
