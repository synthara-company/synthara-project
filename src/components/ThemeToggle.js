import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

const ThemeToggle = ({ displayMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {displayMode === 'dark' ? (
        <Sun size={16} title="Switch to gold mode" />
      ) : displayMode === 'dim' ? (
        <Moon size={16} title="Switch to dark mode" />
      ) : displayMode === 'gold' ? (
        <Palette size={16} title="Switch to blue mode" />
      ) : displayMode === 'blue' ? (
        <Monitor size={16} title="Switch to light mode" />
      ) : (
        <Monitor size={16} title="Switch to dim mode" />
      )}
    </button>
  );
};

ThemeToggle.propTypes = {
  displayMode: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ThemeToggle;
