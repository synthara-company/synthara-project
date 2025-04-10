import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, X, Image, Upload, AlertCircle, Music, Video } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { createPost, updatePost } from '../services/postService';

const PostForm = ({ currentPost, onCancel, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image', 'audio', or 'video'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize form with existing post data or empty strings
    setTitle(currentPost?.title || '');
    setContent(currentPost?.content || '');
    setMediaPreview(currentPost?.mediaUrl || '');
    setMediaType(currentPost?.mediaType || 'image');
  }, [currentPost]);

  // Function to optimize image before upload
  const optimizeImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      console.log('Starting image optimization for:', file.name, 'type:', file.type, 'size:', file.size);

      // If the file is already small enough, just return it
      if (file.size < 500 * 1024) { // Less than 500KB
        console.log('Image already small enough, skipping optimization');
        return resolve(file);
      }

      // Create an image object
      const img = new Image();

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Image optimization timed out'));
      }, 10000); // 10 seconds timeout

      img.onload = () => {
        try {
          clearTimeout(timeout);
          console.log('Image loaded for optimization, dimensions:', img.width, 'x', img.height);

          // Create a canvas element
          const canvas = document.createElement('canvas');

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          console.log('Canvas dimensions set to:', width, 'x', height);

          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          console.log('Image drawn on canvas');

          // Determine output format based on input
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const outputQuality = outputType === 'image/png' ? 0.8 : quality;

          console.log('Converting to blob with type:', outputType, 'quality:', outputQuality);

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error('Canvas to Blob conversion failed');
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }

              try {
                // Create a new file from the blob
                const optimizedFile = new File([blob], file.name, {
                  type: outputType,
                  lastModified: Date.now(),
                });

                console.log(`Image optimized: ${file.size} bytes → ${optimizedFile.size} bytes`);
                resolve(optimizedFile);
              } catch (error) {
                console.error('Error creating File from blob:', error);
                // If we can't create a File, just use the blob
                resolve(blob);
              }
            },
            outputType,
            outputQuality
          );
        } catch (error) {
          console.error('Error in image optimization process:', error);
          clearTimeout(timeout);
          // If optimization fails, return the original file
          resolve(file);
        }
      };

      img.onerror = (error) => {
        console.error('Failed to load image for optimization:', error);
        clearTimeout(timeout);
        // If we can't load the image, just use the original file
        resolve(file);
      };

      // Load image from file
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader loaded image data');
        img.src = e.target.result;
      };
      reader.onerror = (error) => {
        console.error('Failed to read file for optimization:', error);
        clearTimeout(timeout);
        // If we can't read the file, just use the original file
        resolve(file);
      };

      console.log('Starting to read file as data URL');
      reader.readAsDataURL(file);
    });
  };

  const handleMediaChange = async (e) => {
    try {
      const file = e.target.files[0];
      console.log('Selected file:', file);

      if (!file) {
        console.warn('No file selected');
        return;
      }

      // Validate file type based on selected media type
      if (mediaType === 'image' && !file.type.startsWith('image/')) {
        console.warn('Invalid file type selected:', file.type);
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      } else if (mediaType === 'audio' && !file.type.startsWith('audio/')) {
        console.warn('Invalid file type selected:', file.type);
        alert('Please select an audio file (MP3, WAV, etc.)');
        return;
      } else if (mediaType === 'video' && !file.type.startsWith('video/')) {
        console.warn('Invalid file type selected:', file.type);
        alert('Please select a video file (MP4, WebM, etc.)');
        return;
      }

      // Set file size limits based on media type
      let MAX_FILE_SIZE;
      if (mediaType === 'image') {
        MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for images
      } else if (mediaType === 'audio') {
        MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for audio
      } else {
        MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for video
      }

      if (file.size > MAX_FILE_SIZE) {
        console.warn('File too large:', file.size, 'bytes');
        alert(`File is too large. Please select a ${mediaType} smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }

      // Create preview
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
          console.log(`${mediaType} preview created`);
        };
        reader.readAsDataURL(file);
      } catch (previewError) {
        console.error('Error creating preview:', previewError);
        // Continue even if preview fails
      }

      // Optimize image if needed (only for images)
      let fileToUpload = file;
      if (mediaType === 'image') {
        try {
          if (file.size > 500 * 1024) { // Only optimize if larger than 500KB
            console.log('Image needs optimization, processing...');
            fileToUpload = await optimizeImage(file);
          } else {
            console.log('Image small enough, skipping optimization');
          }
        } catch (optimizeError) {
          console.error('Error optimizing image:', optimizeError);
          // If optimization fails, use the original file
          fileToUpload = file;
        }
      }

      // Set the file to upload
      console.log(`Setting ${mediaType} file for upload:`, fileToUpload);
      setMediaFile(fileToUpload);
    } catch (error) {
      console.error(`Unexpected error in handleMediaChange:`, error);
      alert(`Failed to process the selected ${mediaType}. Please try another file.`);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(''); // Clear any previous errors

    try {
      // Validate form
      if (!title.trim()) {
        setError('Please enter a title for your post');
        setIsSubmitting(false);
        return;
      }

      if (!content.trim()) {
        setError('Please enter some content for your post');
        setIsSubmitting(false);
        return;
      }

      if (!mediaFile && !currentPost?.mediaUrl) {
        setError(`Please select ${mediaType === 'image' ? 'an image' : mediaType === 'audio' ? 'an audio file' : 'a video'} for your post`);
        setIsSubmitting(false);
        return;
      }

      const auth = getAuth();
      if (!auth.currentUser) {
        setError('You must be logged in to create/edit posts');
        setIsSubmitting(false);
        return;
      }

      // Prepare post data
      const postData = {
        title,
        content,
        authorId: auth.currentUser.uid,
        mediaType: mediaType // Add media type to post data
      };

      // Initialize progress
      setUploadProgress(0);

      // Progress tracking callback
      const progressCallback = (progress) => {
        setUploadProgress(progress);
      };

      // Update existing post or create new one
      let savedPost;
      if (currentPost?.id) {
        // Update existing post
        savedPost = await updatePost(
          currentPost.id,
          postData,
          mediaFile, // Pass the media file (or null if not changed)
          progressCallback
        );
      } else {
        // Create new post
        savedPost = await createPost(
          postData,
          mediaFile,
          progressCallback
        );
      }

      // Ensure we show 100% when complete
      setUploadProgress(100);

      setIsSubmitting(false);

      // Call onSave with the saved post to update the UI immediately
      if (onSave && typeof onSave === 'function') {
        onSave(savedPost);
      }

      onCancel(); // Close the form after successful save
    } catch (error) {
      console.error('Error saving post:', error);
      setIsSubmitting(false);
      setError(`Failed to save post: ${error.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] p-6 relative overflow-hidden">
      {/* Background pattern using the image */}

      <div className="relative z-10">
      <div className="flex justify-between items-center mb-4">
        <p className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">
          {currentPost ? 'Edit Post' : 'Create New Post'}
        </p>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dim:text-gray-400 dim:hover:text-gray-200 gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 dim:bg-red-900/20 gold:bg-red-50 blue:bg-red-50 border-2 border-red-500 dark:border-red-800 dim:border-red-800 gold:border-red-500 blue:border-red-500 rounded-none text-red-600 dark:text-red-400 dim:text-red-400 gold:text-red-600 blue:text-red-600 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 gold:placeholder-[#D6A756] blue:placeholder-[#8aa5b9] focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white gold:focus:border-black blue:focus:border-black"
            required
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="w-full p-3 border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black placeholder-gray-500 dark:placeholder-gray-400 dim:placeholder-gray-400 gold:placeholder-[#D6A756] blue:placeholder-[#8aa5b9] focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white gold:focus:border-black blue:focus:border-black h-40"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-black dark:text-white dim:text-white gold:text-black blue:text-black">
            {mediaType === 'image' ? <Image size={18} /> : mediaType === 'audio' ? <Music size={18} /> : <Video size={18} />}
            Add {mediaType === 'image' ? 'an image' : mediaType === 'audio' ? 'audio' : 'video'} to your post
          </label>

          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex items-center gap-1 px-3 py-1.5 ${mediaType === 'image' ? 'text-black dark:text-white dim:text-white gold:text-black blue:text-black border-b border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9]' : 'text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]'} transition-colors duration-200`}
            >
              <Image size={16} />
              <span className="text-xs">Image</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('audio')}
              className={`flex items-center gap-1 px-3 py-1.5 ${mediaType === 'audio' ? 'text-black dark:text-white dim:text-white gold:text-black blue:text-black border-b border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9]' : 'text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]'} transition-colors duration-200`}
            >
              <Music size={16} />
              <span className="text-xs">Audio</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex items-center gap-1 px-3 py-1.5 ${mediaType === 'video' ? 'text-black dark:text-white dim:text-white gold:text-black blue:text-black border-b border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9]' : 'text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]'} transition-colors duration-200`}
            >
              <Video size={16} />
              <span className="text-xs">Video</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex-1">
              <div className="relative flex items-center justify-center w-full h-12 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] cursor-pointer hover:border-black dark:hover:border-white dim:hover:border-white gold:hover:border-black blue:hover:border-black transition-colors duration-200">
                <input
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : mediaType === 'audio' ? 'audio/*' : 'video/*'}
                  onChange={handleMediaChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 text-black dark:text-white dim:text-white gold:text-black blue:text-black">
                  <Upload size={18} />
                  <span>Choose {mediaType === 'image' ? 'an image' : mediaType === 'audio' ? 'an audio file' : 'a video'}</span>
                </div>
              </div>
            </label>

            {mediaPreview && (
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="p-2 text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {mediaPreview && (
            <div className="mt-2 relative">
              {mediaType === 'image' && (
                <img
                  src={mediaPreview}
                  alt="Post preview"
                  className="w-full max-h-80 object-contain"
                />
              )}
              {mediaType === 'audio' && (
                <audio
                  controls
                  src={mediaPreview}
                  className="w-full"
                />
              )}
              {mediaType === 'video' && (
                <video
                  controls
                  src={mediaPreview}
                  className="w-full max-h-80 object-contain"
                />
              )}
            </div>
          )}

          {isSubmitting && uploadProgress > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-xs text-black dark:text-white">
                <span>Uploading image...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5">
                <div
                  className="bg-black dark:bg-white h-2.5 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-black dark:text-white dim:text-white gold:text-black blue:text-black border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] hover:border-black dark:hover:border-white dim:hover:border-white gold:hover:border-black blue:hover:border-black transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-black dark:text-white dim:text-white gold:text-black blue:text-black border border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9] flex items-center gap-2 disabled:opacity-50 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dim:hover:bg-white dim:hover:text-black gold:hover:bg-[#D6A756] gold:hover:text-black blue:hover:bg-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
            disabled={isSubmitting}
          >
            <Send size={18} />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

PostForm.propTypes = {
  currentPost: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default PostForm;
