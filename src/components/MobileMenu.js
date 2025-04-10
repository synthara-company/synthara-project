import React from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Zap } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ExternalLink from './ExternalLink';
import LegalLink from './LegalLink';

const MobileMenu = ({ isOpen, onClose, onCreatePost, onToggleAIFeatures }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onClose(); // Close the mobile menu
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-16 bottom-0 w-72 bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] p-5 overflow-y-auto overflow-x-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          <X size={16} />
        </button>

        <nav className="mt-10 space-y-5">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                onToggleAIFeatures();
                onClose();
              }}
              className="flex items-center gap-1.5 text-black dark:text-white dim:text-white text-sm transition-colors duration-200 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400"
            >
              <Zap size={16} />
              AI Lab
            </button>

            <button
              onClick={() => {
                onCreatePost();
                onClose();
              }}
              className="flex items-center gap-1.5 text-black dark:text-white dim:text-white text-sm transition-colors duration-200 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400"
            >
              <Plus size={16} />
              New Post
            </button>
          </div>

          <div className="space-y-2 py-2 mt-2">
            <a
              href="/"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
            >
              Home
            </a>

            <a
              href="/brand"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
            >
              Our Brand
            </a>
            
            <a
              href="/changelog"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
            >
              Changelog
            </a>

            <ExternalLink
              href="https://synthara-ml-platform.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Platform"
            >
              Platform
            </ExternalLink>

            <ExternalLink
              href="https://synthara-ai-chat.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Chat"
            >
              Chat
            </ExternalLink>

            <ExternalLink
              href="https://synthara-ai.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Maverick"
            >
              Maverick
            </ExternalLink>

            <ExternalLink
              href="https://syntharacompany.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Startup"
            >
              Startup
            </ExternalLink>

            <ExternalLink
              href="https://commit-synthara.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Commit"
            >
              Commit
            </ExternalLink>

            <ExternalLink
              href="https://hook-first.vercel.app/"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Hook"
            >
              Hook
            </ExternalLink>

            <ExternalLink
              href="https://synthara-company.github.io/synthara-education-cli"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="CLI"
            >
              CLI
            </ExternalLink>

            <ExternalLink
              href="https://llama4maverick-synthara-ai.vercel.app"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              title="Llama"
            >
              Llama
            </ExternalLink>

            <Link
              to="/settings"
              className="block text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 text-sm"
              onClick={onClose}
            >
              Settings
            </Link>

            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <LegalLink
                type="privacy"
                className="block text-gray-500 dark:text-gray-400 text-xs hover:text-black dark:hover:text-white transition-colors duration-200"
                onClick={onClose}
              >
                Privacy
              </LegalLink>
              <LegalLink
                type="terms"
                className="block text-gray-500 dark:text-gray-400 text-xs hover:text-black dark:hover:text-white transition-colors duration-200"
                onClick={onClose}
              >
                Terms
              </LegalLink>
              <LegalLink
                type="legal"
                className="block text-gray-500 dark:text-gray-400 text-xs hover:text-black dark:hover:text-white transition-colors duration-200"
                onClick={onClose}
              >
                Legal
              </LegalLink>
              <LegalLink
                type="ai-policy"
                className="block text-gray-500 dark:text-gray-400 text-xs hover:text-black dark:hover:text-white transition-colors duration-200"
                onClick={onClose}
              >
                AI
              </LegalLink>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="block text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400 text-sm mt-3 pt-2 transition-colors duration-200"
          >
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  );
};

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreatePost: PropTypes.func.isRequired,
  onToggleAIFeatures: PropTypes.func.isRequired,
};

export default MobileMenu;
