import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      navigate('/');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative m-0 p-0">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] p-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Synthara Logo"
              className="w-24 h-24 mb-4"
            />
          </div>
          <p className="mt-4 text-center text-xl text-black dark:text-white dim:text-white">
            Sign in to your account
          </p>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400">
            Or{' '}
            <Link to="/signup" className="text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-4 text-black dark:text-white dim:text-white">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 text-black dark:text-white dim:text-white focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white focus:z-10 sm:text-sm bg-white dark:bg-gray-800 dim:bg-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 text-black dark:text-white dim:text-white focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white focus:z-10 sm:text-sm bg-white dark:bg-gray-800 dim:bg-gray-700"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 dim:border-gray-600 text-sm text-black dark:text-white dim:text-white bg-white dark:bg-gray-800 dim:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 focus:outline-none ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
