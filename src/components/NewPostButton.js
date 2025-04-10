import React from 'react';

const NewPostButton = ({ onClick }) => {
  return (
    <div className="flex justify-center -mt-6 relative z-20">
      <button
        onClick={onClick}
        className="bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white hover:bg-black dark:hover:bg-white dim:hover:bg-white gold:hover:bg-[#D6A756] blue:hover:bg-[#8aa5b9] text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-white dark:hover:text-black dim:hover:text-black gold:hover:text-black blue:hover:text-black rounded-none p-3.5 shadow-2xl border-2 border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9] transition-all duration-300 transform hover:scale-125 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dim:focus:ring-white gold:focus:ring-[#D6A756] blue:focus:ring-[#8aa5b9] focus:ring-opacity-50 active:scale-95"
        aria-label="Create new post"
      >
        <span className="text-current font-bold">New</span>
      </button>
    </div>
  );
};

export default NewPostButton;
