import React, { useEffect } from 'react';

const OurBrand = ({ displayMode }) => {
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
    <div className="max-w-3xl mx-auto my-16 px-4">
      <div className="space-y-16 text-black dark:text-white dim:text-white gold:text-black blue:text-black">
        <div>
          <p>
            At Synthara, we believe in the power of simplicity. Our design philosophy centers on creating
            clean, harmonious visual experiences with absolutely no noise or redundancy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-3">Typography</p>
            <p>
              We use minimal typography to create a cleaner, more harmonious visual experience.
              By eliminating unnecessary font weights, decorative styling, and excessive variations,
              we ensure that content remains the focus.
            </p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-3">Visual Elements</p>
            <p>
              Our interfaces embrace whitespace and reject visual noise. We eliminate borders, shadows,
              and decorative elements that don't serve a functional purpose, creating a more focused
              user experience.
            </p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-3">Interaction</p>
            <p>
              We design subtle, meaningful interactions that enhance usability without creating
              distraction. Every element has a purpose, and nothing is included that doesn't
              contribute to the user's goals.
            </p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-3">Color</p>
            <p>
              Our color palette is intentionally minimal, using contrast thoughtfully to create
              hierarchy without overwhelming the user. We believe that restraint in color usage
              creates a more harmonious visual experience.
            </p>
          </div>
        </div>

        <div className="mx-auto">
          <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-3">Our Design Principles</p>
          <p>
            Typography to create a cleaner, more harmonious visual experience with no noise.
            Cleaner, more focused user interface with no redundancy.
            Creates no visual noise.
            Further refine the typography and interface to create an even cleaner, more harmonious visual experience with absolutely no noise or redundancy.
          </p>
        </div>

        <div>
          <p>
            This approach allows us to create interfaces that are not only aesthetically pleasing
            but also highly functional and accessible. We believe that the best design is often
            invisible, letting the content and functionality take center stage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurBrand;
