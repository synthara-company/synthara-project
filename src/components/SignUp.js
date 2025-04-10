import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const createUserAccount = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        settings: {
          displayName: '',
          profileImage: '',
          bio: ''
        }
      });

      console.log('Account created successfully');

      // 3. Redirect to settings page for profile completion
      navigate('/settings');
    } catch (err) {
      console.error('Account creation error:', err);
      setError('Failed to create account. Please try again.');
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
            Create your account
          </p>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-4 text-black dark:text-white dim:text-white">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={createUserAccount}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 text-black dark:text-white dim:text-white focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white focus:z-10 sm:text-sm bg-white dark:bg-gray-800 dim:bg-gray-700"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 text-black dark:text-white dim:text-white focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white focus:z-10 sm:text-sm bg-white dark:bg-gray-800 dim:bg-gray-700"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 text-black dark:text-white dim:text-white focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white focus:z-10 sm:text-sm bg-white dark:bg-gray-800 dim:bg-gray-700"
                placeholder="Confirm Password"
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
