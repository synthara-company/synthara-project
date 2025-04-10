import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { Menu, Plus, AlertTriangle, Zap, X } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchPosts, deletePost, initializePostsSystem, updatePostOrder } from './services/postService';
import { Toaster, toast } from 'react-hot-toast';
import Settings from './components/Settings';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Footer from './Footer';
// import ParticlesBackground from './components/ParticlesBackground'; // Removed as requested
import LoadingAnimation from './components/LoadingAnimation';
// Removed FloatingActionButton import as we're using NewPostButton instead
import NewPostButton from './components/NewPostButton';
// Voice Assistant removed as requested

// Import components
import ThemeToggle from './components/ThemeToggle';
import MobileMenu from './components/MobileMenu';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import PostPreviewModal from './components/PostPreviewModal';
import AIFeatures from './components/AIFeatures';
import ExternalLink from './components/ExternalLink';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import CompanyLegal from './components/CompanyLegal';
import AIUsagePolicy from './AIUsagePolicy';
import OurBrand from './components/OurBrand';
import ConsolidatedChangelog from './components/ConsolidatedChangelog';
import ThemeMetaTags from './components/ThemeMetaTags';

// Import Contexts
import { ExternalLinkProvider } from './contexts/ExternalLinkContext';
import { LegalProvider } from './contexts/LegalContext';

const MainContent = ({ displayMode, cycleDisplayMode }) => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewPost, setPreviewPost] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);

  const [, setUser] = useState(null);
  const postFormRef = useRef(null);
  const aiLabRef = useRef(null);

  // Check authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      console.log('Auth state changed:', currentUser ? `User: ${currentUser.uid}` : 'No user');
    });

    return () => unsubscribe();
  }, []);

  // Ensure the correct display mode is applied to the document
  useEffect(() => {
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

  // Initialize posts system
  useEffect(() => {
    initializePostsSystem();
  }, []);

  // Fetch posts from Cloudinary via our service
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await fetchPosts();
        setPosts(fetchedPosts);
        setLoading(false);
        setError('');
      } catch (error) {
        setError('Failed to fetch posts.');
        setLoading(false);
        console.error("Error fetching posts: ", error);
      }
    };

    loadPosts();

    // Set up a refresh interval (every 30 seconds)
    const refreshInterval = setInterval(() => {
      loadPosts();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAIFeatures = () => {
    const willShow = !showAIFeatures;
    setShowAIFeatures(willShow);

    // If showing AI features, wait for render then scroll to it
    if (willShow) {
      setTimeout(() => {
        if (aiLabRef.current) {
          aiLabRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setEditingId(post.id);
  };

  const handlePreview = (post) => {
    setPreviewPost(post);
  };

  const handleClosePreview = () => {
    setPreviewPost(null);
  };

  const handleCreatePost = () => {
    setCurrentPost({}); // Change from null to empty object
    setEditingId(null);
    setIsMenuOpen(false); // Close mobile menu if open

    // Use setTimeout to ensure the form is rendered before scrolling
    setTimeout(() => {
      if (postFormRef.current) {
        postFormRef.current.scrollIntoView({ behavior: 'smooth' });
        // Focus on the first input field
        const firstInput = postFormRef.current.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
      }
    }, 100);
  };

  const handleSave = async (savedPost) => {
    // If we received a saved post, add it to the posts list immediately
    if (savedPost) {
      // For a new post, add it to the beginning of the list
      if (!posts.find(p => p.id === savedPost.id)) {
        setPosts([savedPost, ...posts]);
        toast.success('Post created successfully!');
      } else {
        // For an updated post, replace the existing one
        setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
        toast.success('Post updated successfully!');
      }
    }

    // Also refresh the posts list from storage
    try {
      const refreshedPosts = await fetchPosts(true); // Force refresh
      setPosts(refreshedPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
      toast.error('Error refreshing posts');
    }

    setCurrentPost(null);
    setEditingId(null);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(postId);
      // Update the local posts state to remove the deleted post
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post.');
      toast.error('Failed to delete post');
    }
  };

  const handleReorder = async (postId, newIndex) => {
    try {
      // Optimistically update the UI
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1 || postIndex === newIndex) return;

      // Create a copy of the posts array
      const newPosts = [...posts];
      // Remove the post from its current position
      const [movedPost] = newPosts.splice(postIndex, 1);
      // Insert it at the new position
      newPosts.splice(newIndex, 0, movedPost);

      // Update the state immediately for a responsive UI
      setPosts(newPosts);

      // Update the order in the backend
      const updatedPosts = await updatePostOrder(postId, newIndex);

      // Update the state with the actual order from the backend
      setPosts(updatedPosts);

      toast.success('Post order updated');
    } catch (error) {
      console.error('Error reordering posts:', error);
      // Refresh posts to get the correct order
      const refreshedPosts = await fetchPosts(true);
      setPosts(refreshedPosts);
      toast.error('Failed to reorder posts');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 relative">
      <div className="fixed top-0 z-50 w-full bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-2 md:px-4">
          <header className="py-0.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 mr-2">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">Synthara</span>
              </div>
              <div className="hidden md:flex items-center gap-3 mx-2">
                <a
                  href="/"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                >
                  Home
                </a>
                <a
                  href="/brand"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                >
                  Our Brand
                </a>
                <ExternalLink
                  href="https://synthara-ml-platform.vercel.app"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Platform"
                >
                  Platform
                </ExternalLink>
                <ExternalLink
                  href="https://synthara-ai-chat.vercel.app"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Chat"
                >
                  Chat
                </ExternalLink>
                <ExternalLink
                  href="https://synthara-ai.vercel.app"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Maverick"
                >
                  Maverick
                </ExternalLink>
                <ExternalLink
                  href="https://syntharacompany.vercel.app"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Startup"
                >
                  Startup
                </ExternalLink>
                <ExternalLink
                  href="https://hook-first.vercel.app/"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Hook"
                >
                  Hook
                </ExternalLink>
                <ExternalLink
                  href="https://synthara-company.github.io/synthara-education-cli"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="CLI"
                >
                  CLI
                </ExternalLink>
                <ExternalLink
                  href="https://llama4maverick-synthara-ai.vercel.app"
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm px-2"
                  title="Llama"
                >
                  Llama
                </ExternalLink>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAIFeatures}
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black text-sm hidden md:flex items-center gap-1 transition-colors duration-200 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9]"
                >
                  <Zap size={16} />
                  AI Lab
                </button>
                <button
                  onClick={handleCreatePost}
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black text-sm hidden md:flex items-center gap-1 transition-colors duration-200 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9]"
                >
                  <Plus size={16} />
                  New
                </button>
                <button
                  className="hidden md:block text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm"
                >
                  Sign Out
                </button>
                <ThemeToggle displayMode={displayMode} onToggle={cycleDisplayMode} />
                <button
                  onClick={toggleMenu}
                  className="md:hidden text-black dark:text-white dim:text-white gold:text-black blue:text-black hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200"
                  aria-label="Toggle menu"
                >
                  <Menu size={16} />
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>

      <NewPostButton onClick={handleCreatePost} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10 mt-2 flex flex-col pb-4 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-700">
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onCreatePost={handleCreatePost}
          onToggleAIFeatures={toggleAIFeatures}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <main className="py-4 space-y-6 bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] transition-colors duration-200">
          {/* Plus sign button is now at the top */}
          {!currentPost && (
            <button
              onClick={handleCreatePost}
              className="w-full p-4 border-2 border-dashed border-black dark:border-gray-700 rounded-none text-black dark:text-white hover:border-black dark:hover:border-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all md:hidden bg-white dark:bg-gray-800 shadow-md font-bold"
            >
              Create your first post
            </button>
          )}

          {currentPost !== null && ( // Change condition to check for null specifically
            <div ref={postFormRef}>
              <PostForm
                currentPost={currentPost}
                onSave={handleSave}
                onCancel={() => {
                  setCurrentPost(null);
                  setEditingId(null);
                }}
              />
            </div>
          )}

          {showAIFeatures && (
            <div className="mb-6" ref={aiLabRef}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-wide">AI Lab</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Drag and drop posts here to analyze their content</p>
                </div>
                <button
                  onClick={toggleAIFeatures}
                  className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 hover:scale-110 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <AIFeatures />
            </div>
          )}

          <PostList
            posts={posts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onReorder={handleReorder}
            loading={loading}
          />
        </main>

        {previewPost && (
          <PostPreviewModal
            post={previewPost}
            onClose={handleClosePreview}
          />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem('displayMode') || 'light';
  });

  useEffect(() => {
    // Remove all mode classes first
    document.documentElement.classList.remove('dark', 'dim', 'gold', 'blue');

    // Add the appropriate class based on the current mode
    if (displayMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (displayMode === 'dim') {
      document.documentElement.classList.add('dim');
    } else if (displayMode === 'gold') {
      document.documentElement.classList.add('gold');
    } else if (displayMode === 'blue') {
      document.documentElement.classList.add('blue');
    }

    // Make displayMode available globally for components that need it
    window.displayMode = displayMode;

    localStorage.setItem('displayMode', displayMode);
  }, [displayMode]);

  const cycleDisplayMode = () => {
    setDisplayMode(prevMode => {
      if (prevMode === 'light') return 'dim';
      if (prevMode === 'dim') return 'dark';
      if (prevMode === 'dark') return 'gold';
      if (prevMode === 'gold') return 'blue';
      return 'light';
    });
  };

  return (
    <Router>
      <ThemeMetaTags displayMode={displayMode} />
      <ExternalLinkProvider>
        <LegalProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] transition-colors duration-200 relative m-0 p-0 overflow-x-hidden">
          {/* ParticlesBackground removed as requested */}
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="flex-grow bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] transition-colors duration-200">
          <Routes>
            <Route path="/login" element={<Login displayMode={displayMode} />} />
            <Route path="/settings" element={<Settings displayMode={displayMode} />} />
            <Route path="/signup" element={<SignUp displayMode={displayMode} />} />
            <Route path="/privacy" element={<PrivacyPolicy displayMode={displayMode} />} />
            <Route path="/terms" element={<TermsOfService displayMode={displayMode} />} />
            <Route path="/legal" element={<CompanyLegal displayMode={displayMode} />} />
            <Route path="/ai-policy" element={<AIUsagePolicy displayMode={displayMode} />} />
            <Route path="/brand" element={<OurBrand displayMode={displayMode} />} />
            <Route path="/changelog" element={<ConsolidatedChangelog displayMode={displayMode} />} />
            <Route path="/" element={<MainContent displayMode={displayMode} cycleDisplayMode={cycleDisplayMode} />} />
          </Routes>
        </div>
        <Footer displayMode={displayMode} />
      </div>
        </LegalProvider>
    </ExternalLinkProvider>
    </Router>
  );
};

export default App;
