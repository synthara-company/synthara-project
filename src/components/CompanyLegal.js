import React, { useEffect } from 'react';

const CompanyLegal = ({ displayMode }) => {
  useEffect(() => {
    // Ensure the correct display mode is applied to the document
    document.documentElement.classList.remove('dark', 'dim', 'gold', 'blue');

    if (displayMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (displayMode === 'dim') {
      document.documentElement.classList.add('dim');
    } else if (displayMode === 'gold') {
      document.documentElement.classList.add('gold');
    } else if (displayMode === 'blue') {
      document.documentElement.classList.add('blue');
    }
  }, [displayMode]);
  return (
    <div className="max-w-none">
      <div className="text-gray-800 dark:text-gray-200 dim:text-gray-200 gold:text-gray-800 blue:text-gray-800 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">Last updated: April 10, 2025</p>

        <div className="flex flex-col gap-1">
          <p><span className="font-medium">SYNTHARA</span></p>
          <p className="text-sm">34 SREEBHUMI, ICHAPORE, 24 PGS (N), P.O-NAWABGANJ 743144</p>
          <p className="text-sm">Email: synthara.company@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLegal;