
import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { uploadImage } from '../services/imageUpload';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchUserSettings(user.uid);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchUserSettings = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setSettings(userDoc.data().settings || {});
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be logged in to save settings');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let profileImageUrl = settings.profileImage;

      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile, 'profile-images');
      }

      const updatedSettings = {
        ...settings,
        profileImage: profileImageUrl,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        settings: updatedSettings
      }, { merge: true });

      setSettings(updatedSettings);
      setImageFile(null);
      navigate('/');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] flex items-center justify-center">
        <div className="text-black dark:text-white dim:text-white text-xl p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-black dark:text-white dim:text-white hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Blog</span>
          </Link>
        </div>

        <p className="text-xl text-black dark:text-white dim:text-white mb-8">
          Settings
        </p>

        {error && (
          <div className="mb-6 p-4 text-black dark:text-white dim:text-white">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-black dark:text-white dim:text-white">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-black dark:text-white dim:text-white
                file:mr-4 file:py-2 file:px-4
                file:text-sm
                file:bg-white file:text-black dark:file:bg-gray-800 dark:file:text-white dim:file:bg-gray-700 dim:file:text-white
                file:border file:border-gray-300 dark:file:border-gray-700 dim:file:border-gray-600
                hover:file:text-gray-500 dark:hover:file:text-gray-400 dim:hover:file:text-gray-400
                transition-colors duration-200"
            />
            {settings.profileImage && (
              <div className="mt-2">
                <img
                  src={settings.profileImage}
                  alt="Profile"
                  className="w-24 h-24 object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 text-black dark:text-white dim:text-white border border-gray-300 dark:border-gray-700 dim:border-gray-600 hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 transition-colors duration-200 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
