const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const FormData = require('form-data');
const ytdl = require('ytdl-core');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Enable CORS
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Process video file
app.post('/process-video', upload.single('video'), async (req, res) => {
  try {
    const videoPath = req.file.path;
    const prompt = req.body.prompt || 'Analyze this video';

    // Read the video file
    const videoData = fs.readFileSync(videoPath);

    // Initialize the model (Gemini 1.5 Pro)
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: videoData.toString('base64')
        }
      }
    ]);

    // Clean up the uploaded file
    fs.unlinkSync(videoPath);

    // Send the response
    res.json(result.response);
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process video URL
app.post('/process-video-url', upload.none(), async (req, res) => {
  try {
    const videoUrl = req.body.videoUrl;
    const prompt = req.body.prompt || 'Analyze this video';

    if (!videoUrl) {
      return res.status(400).json({ error: 'No video URL provided' });
    }

    console.log(`Processing video URL: ${videoUrl}`);

    // Download the video from the URL
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'arraybuffer'
    });

    // Get the content type
    const contentType = response.headers['content-type'];

    // Check if it's a video
    if (!contentType.startsWith('video/')) {
      return res.status(400).json({ error: 'URL does not point to a video file' });
    }

    // Initialize the model (Gemini 1.5 Pro)
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: contentType,
          data: Buffer.from(response.data).toString('base64')
        }
      }
    ]);

    // Send the response
    res.json(result.response);
  } catch (error) {
    console.error('Error processing video URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process audio file
app.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = req.file.path;
    const prompt = req.body.prompt || 'Transcribe this audio';

    // Read the audio file
    const audioData = fs.readFileSync(audioPath);

    // Initialize the model (Gemini 1.5 Pro)
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: audioData.toString('base64')
        }
      }
    ]);

    // Clean up the uploaded file
    fs.unlinkSync(audioPath);

    // Send the response
    res.json(result.response);
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process YouTube video
app.post('/process-youtube', upload.none(), async (req, res) => {
  console.log('YouTube processing endpoint called');
  console.log('Request body:', req.body);

  try {
    const videoId = req.body.videoId;
    const prompt = req.body.prompt || 'Analyze this YouTube video';

    console.log('Processing YouTube video with ID:', videoId);

    if (!videoId) {
      return res.status(400).json({ error: 'No YouTube video ID provided' });
    }

    console.log(`Processing YouTube video ID: ${videoId}`);

    // Use a more robust approach to get YouTube video info
    try {
      // First attempt: Use ytdl-core with specific options
      console.log('Attempting to get video info with ytdl-core...');
      const videoInfo = await ytdl.getInfo(videoId, {
        requestOptions: {
          headers: {
            // Add a user agent to mimic a browser request
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      });

      console.log('Video info retrieved successfully');

      // Extract video details from the info
      const videoDetails = {
        title: videoInfo.videoDetails.title || 'Unknown Title',
        description: videoInfo.videoDetails.description || 'No description available',
        channel: videoInfo.videoDetails.author?.name || 'Unknown Channel',
        published: videoInfo.videoDetails.publishDate || 'Unknown Date',
        views: videoInfo.videoDetails.viewCount || 'Unknown',
        likes: videoInfo.videoDetails.likes || 'Unknown',
        duration: videoInfo.videoDetails.lengthSeconds + ' seconds' || 'Unknown Duration',
        keywords: videoInfo.videoDetails.keywords?.join(', ') || 'None',
        category: videoInfo.videoDetails.category || 'Unknown Category',
        isLiveContent: videoInfo.videoDetails.isLiveContent ? 'Yes' : 'No',
        thumbnailUrl: videoInfo.videoDetails.thumbnails?.length > 0 ? videoInfo.videoDetails.thumbnails[0].url : 'No thumbnail'
      };

      console.log('Video details extracted:', videoDetails.title);

      // Second attempt: Try to download a small portion of the video to get a thumbnail
      let thumbnailBase64 = null;
      try {
        console.log('Attempting to get video thumbnail...');
        // Create a temporary file path for the thumbnail
        const tempThumbnailPath = path.join(__dirname, 'uploads', `thumbnail-${videoId}.jpg`);

        // Use axios to download the thumbnail
        if (videoDetails.thumbnailUrl && videoDetails.thumbnailUrl !== 'No thumbnail') {
          const thumbnailResponse = await axios({
            method: 'GET',
            url: videoDetails.thumbnailUrl,
            responseType: 'arraybuffer'
          });

          // Save the thumbnail
          fs.writeFileSync(tempThumbnailPath, thumbnailResponse.data);

          // Convert to base64
          thumbnailBase64 = Buffer.from(thumbnailResponse.data).toString('base64');

          // Clean up
          fs.unlinkSync(tempThumbnailPath);
          console.log('Thumbnail retrieved successfully');
        }
      } catch (thumbnailError) {
        console.error('Error getting thumbnail:', thumbnailError);
        // Continue without thumbnail
      }

      // Initialize the model (Gemini 1.5 Pro)
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

      // Prepare the content for Gemini
      const contentParts = [];

      // Add the prompt and video details as text
      const textPrompt = `${prompt}\n\nVideo Title: ${videoDetails.title}\nDescription: ${videoDetails.description}\nChannel: ${videoDetails.channel}\nPublished: ${videoDetails.published}\nCategory: ${videoDetails.category}\nKeywords: ${videoDetails.keywords}\nDuration: ${videoDetails.duration}\nViews: ${videoDetails.views}\nLikes: ${videoDetails.likes}\nIs Live Content: ${videoDetails.isLiveContent}\n\nPlease provide a detailed analysis of this YouTube video based on the metadata above. Consider the title, description, channel, category, and other details to infer what the video might be about. If possible, analyze the tone, target audience, and potential content of the video.`;

      contentParts.push(textPrompt);

      // Add the thumbnail if available
      if (thumbnailBase64) {
        contentParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: thumbnailBase64
          }
        });
      }

      // Generate content
      console.log('Generating content with Gemini...');
      const result = await model.generateContent(contentParts);

      console.log('Content generated successfully');

      // Send the response
      res.json(result.response);
    } catch (ytdlError) {
      console.error('Error with YouTube video processing:', ytdlError);

      // Fallback: Try to get basic info using a direct API call to YouTube
      try {
        console.log('Attempting to get video info directly...');
        // Construct the YouTube video URL
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Make a request to get the HTML page
        const response = await axios.get(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });

        // Extract basic info from HTML (this is a simple approach and might break if YouTube changes their page structure)
        const html = response.data;

        // Extract title (very basic approach)
        let title = 'Unknown Title';
        const titleMatch = html.match(/<title>([^<]*)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(' - YouTube', '');
        }

        console.log('Basic video info retrieved:', title);

        // Initialize the model (Gemini 1.5 Pro)
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

        // Generate content based on limited info
        const result = await model.generateContent([
          `${prompt}\n\nYouTube Video ID: ${videoId}\nVideo Title: ${title}\nURL: ${videoUrl}\n\nPlease provide an analysis of this YouTube video based on the limited information available. Consider what the title might suggest about the content and purpose of the video.`
        ]);

        res.json(result.response);
      } catch (directError) {
        console.error('Error with direct YouTube access:', directError);

        // Final fallback - just use the video ID
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

        const result = await model.generateContent([
          `${prompt}\n\nI'm analyzing YouTube video with ID: ${videoId}.\n\nPlease note that I cannot access the actual video content, but I can provide some general information about YouTube videos and what might be in this one based on the video ID.`
        ]);

        res.json(result.response);
      }
    }
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
