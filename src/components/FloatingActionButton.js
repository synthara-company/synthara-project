import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center z-50 hover:bg-blue-700 transition-colors duration-200"
      aria-label="Create new post"
    >
      <Plus size={20} />
    </button>
  );
};

export default FloatingActionButton;
