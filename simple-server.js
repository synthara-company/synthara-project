const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3030;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Process YouTube video - simplified version
app.post('/process-youtube', async (req, res) => {
  console.log('YouTube processing endpoint called');
  console.log('Request body:', req.body);
  
  try {
    const videoId = req.body.videoId;
    const prompt = req.body.prompt || 'Analyze this YouTube video';
    
    console.log('Processing YouTube video with ID:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ error: 'No YouTube video ID provided' });
    }
    
    // For testing, just return a mock response
    setTimeout(() => {
      res.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Analysis of YouTube video ${videoId}:\n\n` +
                        `This is a mock response for testing purposes.\n\n` +
                        `The video appears to be a standard YouTube video with ID ${videoId}.\n\n` +
                        `Based on the prompt: "${prompt}"\n\n` +
                        `I would typically analyze the content, identify key frames, objects, people, and provide scene classification.`
                }
              ]
            }
          }
        ]
      });
    }, 2000); // Simulate processing time
    
  } catch (error) {
    console.error('Error processing YouTube video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process video URL - simplified version
app.post('/process-video-url', async (req, res) => {
  console.log('Video URL processing endpoint called');
  console.log('Request body:', req.body);
  
  try {
    const videoUrl = req.body.videoUrl;
    const prompt = req.body.prompt || 'Analyze this video';
    
    console.log('Processing video URL:', videoUrl);
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'No video URL provided' });
    }
    
    // For testing, just return a mock response
    setTimeout(() => {
      res.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Analysis of video at URL ${videoUrl}:\n\n` +
                        `This is a mock response for testing purposes.\n\n` +
                        `The video appears to be hosted at ${videoUrl}.\n\n` +
                        `Based on the prompt: "${prompt}"\n\n` +
                        `I would typically analyze the content, identify key frames, objects, people, and provide scene classification.`
                }
              ]
            }
          }
        ]
      });
    }, 2000); // Simulate processing time
    
  } catch (error) {
    console.error('Error processing video URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process video file - simplified version
app.post('/process-video', async (req, res) => {
  console.log('Video file processing endpoint called');
  
  try {
    // For testing, just return a mock response
    setTimeout(() => {
      res.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Analysis of uploaded video file:\n\n` +
                        `This is a mock response for testing purposes.\n\n` +
                        `I would typically analyze the content, identify key frames, objects, people, and provide scene classification.`
                }
              ]
            }
          }
        ]
      });
    }, 2000); // Simulate processing time
    
  } catch (error) {
    console.error('Error processing video file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Simple server running on port ${port}`);
  console.log(`Test the server by visiting: http://localhost:${port}/test`);
});
