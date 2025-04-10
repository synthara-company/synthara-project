const getCloudinaryUrl = (mediaType = 'image') => {
  // Determine the resource type based on media type
  const resourceType = mediaType === 'video' ? 'video' : 'auto';
  return `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
};

/**
 * Uploads a media file (image, audio, or video) and associated post data to Cloudinary
 * @param {File|Blob} file - The media file to upload
 * @param {Object} postData - The post data to store with the media
 * @param {string} folder - The folder to store the media in
 * @param {Function} onProgress - Callback for upload progress
 * @returns {Promise<Object>} - The uploaded post data including media URL
 */
export const uploadPost = async (file, postData = {}, folder = 'post-media', onProgress = null) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting upload for file:', file, 'with post data:', postData);

      // Validate input
      if (!file) {
        console.error('No file provided for upload');
        return reject(new Error('No file provided for upload'));
      }

      const formData = new FormData();

      // Determine media type from file or postData
      const mediaType = postData.mediaType ||
                       (file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('audio/') ? 'audio' :
                        file.type.startsWith('video/') ? 'video' : 'image');

      // Set the appropriate folder based on media type
      const mediaFolder = mediaType === 'image' ? 'post-images' :
                         mediaType === 'audio' ? 'post-audio' : 'post-videos';

      // Handle both File objects and Blobs
      if (file instanceof Blob) {
        // If it's a Blob but not a File, create a File from it
        if (!(file instanceof File)) {
          console.log('Converting Blob to File for upload');
          try {
            let fileName;
            let fileType;

            if (mediaType === 'image') {
              fileName = 'image-' + Date.now() + '.jpg';
              fileType = 'image/jpeg';
            } else if (mediaType === 'audio') {
              fileName = 'audio-' + Date.now() + '.mp3';
              fileType = 'audio/mpeg';
            } else {
              fileName = 'video-' + Date.now() + '.mp4';
              fileType = 'video/mp4';
            }

            file = new File([file], fileName, { type: fileType });
          } catch (fileError) {
            console.warn('Could not convert Blob to File, using Blob directly:', fileError);
            // If File creation fails, use the Blob directly
            formData.append('file', file);
            formData.append('filename', mediaType + '-' + Date.now() + '.' +
                           (mediaType === 'image' ? 'jpg' :
                            mediaType === 'audio' ? 'mp3' : 'mp4'));
          }
        }
      }

      // If we have a File object at this point, append it normally
      if (file instanceof File) {
        console.log('Appending File to FormData:', file.name, file.type, file.size);
        formData.append('file', file);
      }

      // Get the appropriate Cloudinary URL based on media type
      const CLOUDINARY_URL = getCloudinaryUrl(mediaType);

      // Add other required parameters
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', mediaFolder || folder);

      // Add post data as context
      if (postData) {
        // Add title and content as caption and alt text
        if (postData.title) {
          formData.append('context', `caption=${encodeURIComponent(postData.title)}`);
        }

        if (postData.content) {
          // Add content as a tag instead of alt text (which might be too large)
          formData.append('tags', postData.content.substring(0, 100)); // Limit tag length
        }

        // Add a unique tag to identify this as a post
        formData.append('tags', `post_${Date.now()}`);

        // Add author ID as a tag if available
        if (postData.authorId) {
          formData.append('tags', `author_${postData.authorId}`);
        }
      }

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            console.log(`Upload progress: ${percentComplete}%`);
            onProgress(percentComplete);
          }
        });
      }

      // Set up completion handler
      xhr.addEventListener('load', () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            console.log('Upload successful, received data:', data);

            // Return both the image URL and the post data
            const result = {
              ...postData,
              mediaUrl: data.secure_url,
              mediaType: mediaType,
              publicId: data.public_id,
              version: data.version,
              format: data.format,
              createdAt: postData.createdAt || Date.now(),
              updatedAt: Date.now(),
              id: postData.id || `post_${Date.now()}`
            };

            resolve(result);
          } else {
            // Log detailed error information
            console.error(`Upload failed with status ${xhr.status}:`, xhr.responseText);
            console.error('Request details:', {
              url: CLOUDINARY_URL,
              uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
              cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
              fileInfo: file instanceof File ? { name: file.name, type: file.type, size: file.size } : 'Not a File object'
            });

            // Try to parse the error response
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('Cloudinary error details:', errorData);
              reject(new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
          }
        } catch (parseError) {
          console.error('Error parsing upload response:', parseError, 'Response:', xhr.responseText);
          reject(new Error('Invalid response from upload server'));
        }
      });

      // Set up error handler
      xhr.addEventListener('error', (event) => {
        console.error('Network error during upload:', event);
        reject(new Error('Network error during upload'));
      });

      // Set up abort handler
      xhr.addEventListener('abort', () => {
        console.warn('Upload aborted');
        reject(new Error('Upload aborted'));
      });

      // Set up timeout handler
      xhr.addEventListener('timeout', () => {
        console.error('Upload timed out');
        reject(new Error('Upload timed out'));
      });

      // Set a longer timeout for large files
      xhr.timeout = 60000; // 60 seconds

      // Open and send the request
      console.log('Sending upload request to:', CLOUDINARY_URL);
      xhr.open('POST', CLOUDINARY_URL, true);
      xhr.send(formData);
    } catch (error) {
      console.error('Post upload error:', error);
      reject(new Error('Failed to upload post: ' + error.message));
    }
  });
};

// Keep the original function for backward compatibility
export const uploadImage = async (file, folder = 'post-images', onProgress = null) => {
  try {
    const result = await uploadPost(file, {}, folder, onProgress);
    return result.imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};