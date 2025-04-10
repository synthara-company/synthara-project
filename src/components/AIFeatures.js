import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Mic, Video, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import '../markdown-styles.css';

// Helper function to convert a file to base64
// This function is used in the actual API implementation (currently commented out)
// eslint-disable-next-line no-unused-vars
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., 'data:image/jpeg;base64,')
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const AIFeatures = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('image');
  // Voice recognition state removed
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUsingVideoUrl, setIsUsingVideoUrl] = useState(false);
  const fileInputRef = useRef(null);
  const responseContainerRef = useRef(null);

  // Check if API key is available
  const apiKey = process.env.REACT_APP_TOGETHER_API_KEY;
  console.log('API Key available:', apiKey ? 'Yes' : 'No');

  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [response]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('handleFileChange called with file:', selectedFile);

    if (!selectedFile) {
      console.warn('No file selected in handleFileChange');
      return;
    }

    console.log('Setting file:', selectedFile.name, selectedFile.type, selectedFile.size);
    setFile(selectedFile);

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    console.log('Created preview URL:', previewUrl);
    setPreview(previewUrl);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submit button clicked');
    console.log('Current state:', {
      activeTab,
      file: file ? file.name : null,
      isUsingVideoUrl,
      videoUrl,
      isYouTubeVideo: window.isYouTubeVideo
    });

    // Check if we have a file or video URL (for video tab)
    if (!file && !(isUsingVideoUrl && videoUrl)) {
      const errorMsg = activeTab === 'video' ? 'Please upload a video file or enter a video URL.' : 'Please upload a file first.';
      console.log('Validation error:', errorMsg);
      setResponse(errorMsg);
      return;
    }

    if (loading) {
      console.log('Already loading, ignoring submit');
      return;
    }

    setLoading(true);
    setResponse(''); // Clear previous response

    try {
      if (file) {
        console.log(`Processing ${activeTab} file:`, file.name);
      } else if (isUsingVideoUrl) {
        console.log(`Processing ${activeTab} URL:`, videoUrl);
      }

      let result;

      switch (activeTab) {
        case 'image':
          result = await processImage();
          break;
        case 'audio':
          result = await processAudio();
          break;
        case 'video':
          result = await processVideo();
          break;
        default:
          throw new Error('Invalid tab selected');
      }

      console.log(`${activeTab} processing complete`);
      setResponse(result);
    } catch (error) {
      console.error(`Error processing ${activeTab}:`, error);
      setResponse(`Error: ${error.message || 'Something went wrong. Please try again.'}

If this error persists, please check your API key configuration or contact support.`);
    } finally {
      setLoading(false);
    }
  };

  const processImage = async () => {
    try {
      if (!apiKey) {
        console.warn('API key not found. Please add your API key to the .env file.');
        return `Error: API key not found. Please add your REACT_APP_TOGETHER_API_KEY to the .env file.`;
      }

      // Check file size - Together AI has a limit (typically 20MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 20) {
        return `Error: Image file is too large (${fileSizeMB.toFixed(2)} MB). Please use a file smaller than 20 MB.

Tip: You can use an image editor or an online image compressor to reduce the file size.`;
      }

      console.log('Processing image with API key');

      // Convert the image file to base64
      const base64Image = await convertFileToBase64(file);

      // Make the actual API call to Together AI
      console.log('Making API call to Together AI');

      const response = await fetch('https://api.together.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt || 'Describe this image in detail. Identify objects, people, scenes, colors, and any other notable elements.' },
                { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content || 'No content in response';
      } else {
        console.error('Unexpected response format:', data);
        return 'Received an unexpected response format from the API.';
      }
    } catch (error) {
      console.error('Error in processImage:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  };

  const processAudio = async () => {
    try {
      // For Gemini API, we'll use the GEMINI_API_KEY from the environment
      const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!geminiApiKey) {
        console.warn('Gemini API key not found. Please add your API key to the .env file.');
        return `Error: API key not found. Please add your REACT_APP_GEMINI_API_KEY to the .env file.`;
      }

      // Check file size - Gemini has a limit (typically 20MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 20) {
        return `Error: Audio file is too large (${fileSizeMB.toFixed(2)} MB). Please use a file smaller than 20 MB.

Tip: You can use a tool like Audacity or an online audio compressor to reduce the file size.`;
      }

      console.log('Processing audio with Gemini API');

      // Using our backend proxy server to avoid CORS issues
      console.log('Sending audio to backend proxy server');

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('prompt', prompt || 'Transcribe this audio. Identify the speaker if possible and any background noises. Provide a detailed analysis of the audio content.');

      // Make the API call to our backend server
      console.log('Sending request to process-audio endpoint');
      let response;
      try {
        response = await fetch('http://localhost:3030/process-audio', {
          method: 'POST',
          body: formData
        });
        console.log('Response status:', response.status);
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError);
        return `Error connecting to the server: ${fetchError.message}\n\nPlease make sure the server is running at http://localhost:3030.`;
      }

      if (!response.ok) {
        let errorData;
        let errorText;
        try {
          // Clone the response before reading it
          const responseClone = response.clone();
          try {
            errorData = await responseClone.json();
            console.error('Backend server error (json):', response.status, errorData);
          } catch (jsonError) {
            // If it's not JSON, try to get the text
            errorText = await response.text();
            console.error('Backend server error (text):', response.status, errorText);

            // Check for quota exceeded error
            if (response.status === 429) {
              return `Error: API quota exceeded. The Gemini API has rate limits for free usage.\n\nPlease try again later or consider upgrading to a paid tier for higher quotas.\n\nDetails: ${errorText}`;
            }

            return `Backend server error ${response.status}: ${errorText}`;
          }
        } catch (e) {
          console.error('Error reading response:', e);
          return `Error reading server response: ${e.message}`;
        }

        // If we got JSON error data
        if (errorData) {
          // Check for model overload error
          const isOverloaded =
            (response.status === 503 && typeof errorData.error === 'string' && errorData.error.includes('overloaded')) ||
            (errorData.error?.error?.message && errorData.error.error.message.includes('overloaded'));

          if (isOverloaded) {
            return `Error: The Gemini model is currently overloaded with requests.\n\nThis is a temporary issue that occurs during peak usage times. Please try again in a few minutes.\n\nAlternative options:\n1. Try again with a smaller file\n2. Try again during off-peak hours\n3. Try the image recognition feature which uses a different model`;
          }

          // Check for quota exceeded error
          if (response.status === 429) {
            return `Error: API quota exceeded. The Gemini API has rate limits for free usage.\n\nPlease try again later or consider upgrading to a paid tier for higher quotas.\n\nDetails: ${JSON.stringify(errorData)}`;
          }

          return `Backend server error ${response.status}: ${JSON.stringify(errorData)}`;
        }

        return `Unknown error from server (status ${response.status})`;
      }

      // Clone the response before reading it as JSON
      const responseClone = response.clone();
      let data;
      try {
        data = await responseClone.json();
        console.log('Backend server response:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        // Try to get the text if JSON parsing fails
        const textResponse = await response.text();
        return `Error parsing server response: ${jsonError.message}\n\nRaw response: ${textResponse.substring(0, 100)}...`;
      }

      // Extract the response text from Gemini's response format
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts.length > 0) {
          return content.parts[0].text || 'No content in response';
        }
      }

      console.error('Unexpected response format:', data);
      return 'Received an unexpected response format from the API.';
    } catch (error) {
      console.error('Error in processAudio:', error);
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  };

  const processVideo = async () => {
    try {
      // For Gemini API, we'll use the GEMINI_API_KEY from the environment
      const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!geminiApiKey) {
        console.warn('Gemini API key not found. Please add your API key to the .env file.');
        return `Error: API key not found. Please add your REACT_APP_GEMINI_API_KEY to the .env file.`;
      }

      // Prepare the request based on whether we're using a URL or a file
      let endpoint, formData;

      if (isUsingVideoUrl && videoUrl) {
        console.log('Processing video URL with Gemini API:', videoUrl);

        // Check if it's a YouTube URL
        const isYoutube = isYouTubeUrl(videoUrl) || window.isYouTubeVideo;
        console.log('Is YouTube video?', isYoutube);

        if (isYoutube) {
          const videoId = extractYouTubeId(videoUrl);
          console.log('Extracted YouTube ID for processing:', videoId);

          if (!videoId) {
            console.error('Failed to extract YouTube video ID for processing');
            return 'Error: Could not extract YouTube video ID from the provided URL. Please check the URL and try again.';
          }

          endpoint = 'http://localhost:3030/process-youtube';
          console.log('Using YouTube processing endpoint:', endpoint);

          formData = new FormData();
          formData.append('videoId', videoId);
          formData.append('prompt', prompt || 'Analyze this YouTube video. Identify key frames, objects, people, and provide a scene classification. Describe the content in detail and transcribe any speech if possible.');
        } else {
          // Regular video URL
          endpoint = 'http://localhost:3030/process-video-url';
          console.log('Using direct video URL endpoint:', endpoint);

          formData = new FormData();
          formData.append('videoUrl', videoUrl);
          formData.append('prompt', prompt || 'Analyze this video. Identify key frames, objects, people, and provide a scene classification. Describe the content in detail and transcribe any speech if possible.');
        }
      } else {
        // Check file size - Gemini has a limit (typically 20MB)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 20) {
          return `Error: Video file is too large (${fileSizeMB.toFixed(2)} MB). Please use a file smaller than 20 MB.

Tip: You can use a tool like HandBrake or an online video compressor to reduce the file size.`;
        }

        console.log('Processing video file with Gemini API');
        endpoint = 'http://localhost:3030/process-video';

        formData = new FormData();
        formData.append('video', file);
        formData.append('prompt', prompt || 'Analyze this video. Identify key frames, objects, people, and provide a scene classification. Describe the content in detail and transcribe any speech if possible.');
      }

      // Make the API call to our backend server
      console.log(`Sending request to ${endpoint}`);
      console.log('Request payload:', {
        method: 'POST',
        formData: Array.from(formData.entries()).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {})
      });

      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        console.log('Response status:', response.status);
      } catch (fetchError) {
        console.error('Network error during fetch:', fetchError);
        return `Error connecting to the server: ${fetchError.message}\n\nPlease make sure the server is running at ${endpoint}.`;
      }

      // Handle error responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          console.error('Backend server error (text):', response.status, errorText);

          if (response.status === 429) {
            return `Error: API quota exceeded. The Gemini API has rate limits for free usage.

Please try again later or consider upgrading to a paid tier for higher quotas.

Details: ${errorText}`;
          }

          throw new Error(`Backend server error ${response.status}: ${errorText}`);
        }

        console.error('Backend server error (json):', response.status, errorData);

        // Check for model overload error
        const isOverloaded =
          (response.status === 503 && typeof errorData.error === 'string' && errorData.error.includes('overloaded')) ||
          (errorData.error?.error?.message && errorData.error.error.message.includes('overloaded'));

        if (isOverloaded) {
          return `Error: The Gemini model is currently overloaded with requests.

This is a temporary issue that occurs during peak usage times. Please try again in a few minutes.

Alternative options:
1. Try again with a smaller file
2. Try again during off-peak hours
3. Try the image recognition feature which uses a different model`;
        }

        if (response.status === 429) {
          return `Error: API quota exceeded. The Gemini API has rate limits for free usage.

Please try again later or consider upgrading to a paid tier for higher quotas.

Details: ${JSON.stringify(errorData)}`;
        }

        throw new Error(`Backend server error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      // Process successful response
      const data = await response.json();
      console.log('Backend server response:', data);

      // Extract the response text from Gemini's response format
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts.length > 0) {
          return content.parts[0].text || 'No content in response';
        }
      }

      console.error('Unexpected response format:', data);
      return 'Received an unexpected response format from the API.';
    } catch (error) {
      console.error('Error in processVideo:', error);
      return `Video processing failed: ${error.message}`;
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview('');
    setVideoUrl('');
    setIsUsingVideoUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to extract YouTube video ID from various YouTube URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;

    // Regular expressions for different YouTube URL formats
    // eslint-disable-next-line no-useless-escape
    const regexps = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\n]+)/,
      /youtube\.com\/embed\/([^&?\n]+)/,
      /youtube\.com\/v\/([^&?\n]+)/,
      /youtube\.com\/user\/[^&?\n]+\/?v=([^&?\n]+)/
    ];

    for (const regex of regexps) {
      const match = url.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const isYouTubeUrl = (url) => {
    const result = url.includes('youtube.com') || url.includes('youtu.be');
    console.log('Checking if URL is YouTube:', url, result);
    return result;
  };

  const handleVideoUrl = async (url) => {
    if (!url) return;

    console.log('handleVideoUrl called with:', url);

    try {
      setVideoUrl(url);
      setIsUsingVideoUrl(true);
      setFile(null);

      // Check if it's a YouTube URL
      if (isYouTubeUrl(url)) {
        console.log('Detected YouTube URL');
        const videoId = extractYouTubeId(url);
        console.log('Extracted YouTube ID:', videoId);

        if (videoId) {
          // Create YouTube embed URL for preview
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          setPreview(embedUrl);
          console.log('Using YouTube video:', videoId, 'Embed URL:', embedUrl);

          // Add a flag to indicate this is a YouTube URL
          window.isYouTubeVideo = true;
        } else {
          console.error('Failed to extract YouTube video ID');
          throw new Error('Could not extract YouTube video ID from URL');
        }
      } else {
        // For direct video URLs
        setPreview(url);
        console.log('Using direct video URL:', url);
        window.isYouTubeVideo = false;
      }
    } catch (error) {
      console.error('Error handling video URL:', error);
      alert('Failed to process the video URL. Please try a different URL.');
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'image':
        return <ImageIcon size={20} />;
      case 'audio':
        return <Mic size={20} />;
      case 'video':
        return <Video size={20} />;
      // Voice recognition case removed
      default:
        return null;
    }
  };

  const getFileAccept = () => {
    switch (activeTab) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      case 'video':
        return 'video/*';
      default:
        return '';
    }
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'image':
        return 'Describe what you want to know about this image...';
      case 'audio':
        return 'What would you like to know about this audio?';
      case 'video':
        return 'Ask something about this video...';
      default:
        return 'Enter your prompt...';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Helper function to set the active tab based on content
  const setActiveTabBasedOnContent = (content) => {
    if (content.includes('audio') || content.toLowerCase().includes('listen')) {
      setActiveTab('audio');
    } else if (content.includes('video') || content.toLowerCase().includes('watch')) {
      setActiveTab('video');
    } else {
      setActiveTab('image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    // First check if files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('File dropped:', file.name, file.type);

      // Determine file type and set the appropriate tab
      if (file.type.startsWith('image/')) {
        setActiveTab('image');
      } else if (file.type.startsWith('audio/')) {
        setActiveTab('audio');
      } else if (file.type.startsWith('video/')) {
        setActiveTab('video');
      }

      // Handle the file upload
      handleFileChange({ target: { files: e.dataTransfer.files } });
      return;
    }

    // If no files, try to process as post data
    try {
      const postData = e.dataTransfer.getData('application/json');
      console.log('Received drop data:', postData);

      if (postData) {
        const post = JSON.parse(postData);
        console.log('Parsed post data:', post, 'Media URL:', post.mediaUrl || post.imageUrl, 'Media Type:', post.mediaType || 'image');

        // Set the post content as the prompt
        setPrompt(post.content || '');

        // Get the media URL (support both mediaUrl and imageUrl for backward compatibility)
        const mediaUrl = post.mediaUrl || post.imageUrl;
        const mediaType = post.mediaType || 'image'; // Default to image for backward compatibility

        // Check if the post has media
        if (mediaUrl) {
          // Set the active tab based on media type
          setActiveTab(mediaType);
          console.log(`Processing post with ${mediaType} at URL: ${mediaUrl}`);

          // Fetch the media from the URL
          fetch(mediaUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
              }
              return response.blob();
            })
            .then(blob => {
              // Determine the file type and name based on media type
              let fileName, fileType;

              if (mediaType === 'image') {
                fileName = `post-image-${post.id}.jpg`;
                fileType = 'image/jpeg';
              } else if (mediaType === 'audio') {
                fileName = `post-audio-${post.id}.mp3`;
                fileType = 'audio/mpeg';
              } else { // video
                fileName = `post-video-${post.id}.mp4`;
                fileType = 'video/mp4';
              }

              console.log(`Creating ${mediaType} file: ${fileName} with type ${fileType}`);

              // Create a File object from the blob
              const mediaFile = new File([blob], fileName, { type: fileType });

              // Directly set the file and preview instead of using DataTransfer API
              // which may not be supported in all browsers
              console.log('Setting media file directly:', mediaFile.name, mediaFile.type, mediaFile.size);
              setFile(mediaFile);
              const previewUrl = URL.createObjectURL(mediaFile);
              console.log('Created preview URL:', previewUrl);
              setPreview(previewUrl);
            })
            .catch(error => {
              console.error(`Error fetching post ${mediaType}:`, error);
              // If fetching the media fails, just set the tab based on content
              setActiveTabBasedOnContent(post.content || '');
            });
        } else {
          // If no media, set the tab based on content
          setActiveTabBasedOnContent(post.content || '');
        }

        setResponse('');
      }
    } catch (error) {
      console.error('Error processing dropped post:', error);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] ${isDragOver ? 'border-l-2 border-blue-500 dark:border-blue-400 dim:border-blue-400 gold:border-[#D6A756] blue:border-[#8aa5b9]' : ''} overflow-hidden max-h-screen flex flex-col transition-colors duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div>
        <div className="flex">
          {['image', 'audio', 'video'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                clearFile();
                setResponse('');
              }}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 text-xs transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-black dark:text-white dim:text-white gold:text-black blue:text-black border-b border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9]'
                  : 'text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black'
              }`}
            >
              {getTabIcon(tab)}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 relative bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0]">
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900 dim:bg-blue-900 gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center p-4 bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0]">
              <p className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">Drop File or Post Here</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">Drop an image, audio, or video file for direct upload</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">Or drop a post to use its image and content</p>
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-black dark:text-white dim:text-white gold:text-black blue:text-black">
              Upload {activeTab === 'image' ? 'an image' : activeTab === 'audio' ? 'an audio file' : 'a video'}
            </label>
            {file && (
              <button
                onClick={clearFile}
                className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Video URL input field (only for video tab) */}
          {activeTab === 'video' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-black dark:text-white dim:text-white gold:text-black blue:text-black">
                  Or enter a video URL
                </label>
                {isUsingVideoUrl && videoUrl && (
                  <button
                    onClick={clearFile}
                    className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] hover:text-black dark:hover:text-white dim:hover:text-white gold:hover:text-black blue:hover:text-black transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white gold:focus:border-black blue:focus:border-black bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black"
                />
                <button
                  type="button"
                  onClick={() => handleVideoUrl(videoUrl)}
                  className="text-black dark:text-white dim:text-white gold:text-black blue:text-black py-2 px-4 border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] hover:border-black dark:hover:border-white dim:hover:border-white gold:hover:border-black blue:hover:border-black transition-colors duration-200"
                >
                  Use URL
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mt-1">
                Enter a YouTube link (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ) or a direct link to a video file (MP4, WebM, etc.)
              </p>
            </div>
          )}

          <div
            className={`border border-dashed p-4 text-center ${
              file || (isUsingVideoUrl && videoUrl) ? 'border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9]' : 'border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9]'
            } hover:border-black dark:hover:border-white dim:hover:border-white gold:hover:border-black blue:hover:border-black transition-colors duration-200 cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileChange({ target: { files: e.dataTransfer.files } });
              }
            }}
          >
            {!file && !(isUsingVideoUrl && videoUrl) ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  {getTabIcon(activeTab)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">
                  Drag and drop your {activeTab} file here, or{' '}
                  <label className="text-black dark:text-white dim:text-white gold:text-black blue:text-black cursor-pointer hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept={getFileAccept()}
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">
                  {activeTab === 'image' ? 'PNG, JPG, GIF up to 10MB' :
                   activeTab === 'audio' ? 'MP3, WAV, M4A up to 20MB' :
                   'MP4, MOV, WEBM up to 50MB'}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black">Upload File</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">or</span>
                  <span className="text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black">Drop File Here</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9]">or</span>
                  <span className="text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black">Drop Post</span>
                </div>
              </div>
            ) : (
              <div className="relative group">
                {activeTab === 'image' && preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-80 w-full mx-auto object-contain"
                  />
                )}
                {activeTab === 'audio' && (
                  <audio controls className="w-full mt-2">
                    <source src={preview} type={file.type} />
                    Your browser does not support the audio element.
                  </audio>
                )}
                {activeTab === 'video' && (
                  isUsingVideoUrl && isYouTubeUrl(videoUrl) ? (
                    <iframe
                      src={preview}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-48 mx-auto"
                    ></iframe>
                  ) : (
                    <video controls className="max-h-48 mx-auto">
                      <source src={preview} type={isUsingVideoUrl ? 'video/mp4' : file.type} />
                      Your browser does not support the video element.
                    </video>
                  )
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black py-2 px-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dim:hover:bg-white dim:hover:text-black gold:hover:bg-[#D6A756] gold:hover:text-black blue:hover:bg-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                  >
                    Replace File
                  </button>
                </div>
                <p className="mt-2 text-sm text-black dark:text-white dim:text-white gold:text-black blue:text-black">
                  {isUsingVideoUrl ? videoUrl : `${file.name} (${Math.round(file.size / 1024)} KB)`}
                </p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black mb-1">
              Prompt (optional)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black focus:outline-none focus:border-black dark:focus:border-white dim:focus:border-white gold:focus:border-black blue:focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={(!file && !(isUsingVideoUrl && videoUrl)) || loading}
            className={`w-full py-2 px-4 flex items-center justify-center gap-2 ${
              (!file && !(isUsingVideoUrl && videoUrl)) || loading
                ? 'bg-gray-100 dark:bg-[#111111] dim:bg-[#374151] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] text-gray-400 dark:text-gray-500 dim:text-gray-500 gold:text-[#D6A756] blue:text-[#8aa5b9] cursor-not-allowed border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9]'
                : 'bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white text-black dark:text-white dim:text-white gold:text-black blue:text-black border border-black dark:border-white dim:border-white gold:border-[#D6A756] blue:border-[#8aa5b9] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dim:hover:bg-white dim:hover:text-black gold:hover:bg-[#D6A756] gold:hover:text-black blue:hover:bg-[#8aa5b9] blue:hover:text-black transition-colors duration-200'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Process {activeTab}</span>
              </>
            )}
          </button>
        </form>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <h3 className="text-sm text-black dark:text-white dim:text-white gold:text-black blue:text-black mb-1">Results</h3>
            <div
              ref={responseContainerRef}
              className="bg-white dark:bg-[#111111] dim:bg-[#374151] gold:bg-white blue:bg-white p-3 max-h-60 overflow-y-auto text-xs text-black dark:text-white dim:text-white gold:text-black blue:text-black border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9]"
            >
              <div className="markdown-content">
                <ReactMarkdown>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIFeatures;
