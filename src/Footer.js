// src/Footer.js
import React, { useEffect } from 'react';
import { Mail } from 'lucide-react';
import ExternalLink from './components/ExternalLink';
import LegalLink from './components/LegalLink';

const Footer = ({ displayMode }) => {
  useEffect(() => {
    // Ensure the correct display mode is applied to the document
    document.documentElement.classList.remove('dark', 'dim');

    if (displayMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (displayMode === 'dim') {
      document.documentElement.classList.add('dim');
    }
  }, [displayMode]);
  return (
    <footer className="bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] py-3 w-full z-10 mt-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">Synthara</span>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black">
            <a href="/" className="hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">Home</a>
            <a href="/brand" className="hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">Our Brand</a>
            <a href="/settings" className="hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">Settings</a>
            <a href="/login" className="hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">Login</a>
            <a href="/changelog" className="hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">Changelog</a>
          </div>

          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">
            <LegalLink type="privacy" className="hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200">Privacy</LegalLink>
            <LegalLink type="terms" className="hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200">Terms</LegalLink>
            <LegalLink type="legal" className="hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200">Legal</LegalLink>
            <LegalLink type="ai-policy" className="hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200">AI</LegalLink>
          </div>

          <div className="flex gap-3 mt-2">
            {/* GitHub */}
            <ExternalLink
              href="https://github.com/synthara-company"
              className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </ExternalLink>

            {/* X (Twitter) */}
            <ExternalLink
              href="https://x.com/syntharacompany"
              className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              aria-label="X (Twitter)"
              title="X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </ExternalLink>

            {/* LinkedIn */}
            <ExternalLink
              href="https://www.linkedin.com/company/synthara-company/"
              className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </ExternalLink>

            {/* Email */}
            <ExternalLink
              href="mailto:synthara.company@gmail.com"
              className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              aria-label="Email"
              title="Email"
            >
              <Mail size={16} />
            </ExternalLink>
          </div>
        </div>

        <div className="mt-2 pt-2">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mb-2">
            &copy; Synthara 2025
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <ExternalLink href="https://syntharacompany.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Startup">Startup</ExternalLink>
            <ExternalLink href="https://synthara-ai-chat.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Chat">Chat</ExternalLink>
            <ExternalLink href="https://synthara-ml-platform.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Platform">Platform</ExternalLink>
            <ExternalLink href="https://synthara-ai.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Maverick">Maverick</ExternalLink>
            <ExternalLink href="https://commit-synthara.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Commit">Commit</ExternalLink>
            <ExternalLink href="https://hook-first.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Hook">Hook</ExternalLink>
            <ExternalLink href="https://synthara-company.github.io/synthara-education-cli" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="CLI">CLI</ExternalLink>
            <ExternalLink href="https://llama4maverick-synthara-ai.vercel.app" className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200 text-xs" title="Llama">Llama</ExternalLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
