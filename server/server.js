require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3030;

// Enable CORS for all routes
app.use(cors());

// Set up multer for file uploads
const upload = multer();

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Gemini API Proxy Server is running');
});

// Test endpoint for Gemini API
app.get('/test-gemini', async (req, res) => {
  try {
    console.log('Testing Gemini API connection...');
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent',
      {
        contents: [{
          parts: [{ text: 'Say hello and confirm that you are working correctly.' }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    console.log('Gemini API test successful');
    res.json({
      status: 'success',
      message: 'Gemini API is working correctly',
      response: response.data
    });
  } catch (error) {
    console.error('Gemini API test failed:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini API test failed',
      error: error.response?.data || error.message
    });
  }
});

// Process audio endpoint
app.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`Processing audio file: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`);

    // Convert file buffer to base64
    const audioBase64 = req.file.buffer.toString('base64');

    // Get the prompt from the request or use a default
    const prompt = req.body.prompt || 'Transcribe this audio. Identify the speaker and any background noises. Provide a confidence score for the transcription.';

    console.log(`Using prompt: ${prompt}`);
    console.log('Making API call to Gemini...');

    // Make the API call to Gemini
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent',
      {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: audioBase64
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'text/plain'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    console.log('Received response from Gemini');

    // Format the response as Markdown if it's not already
    let formattedResponse = response.data;

    // Check if we have a valid response with content
    if (formattedResponse.candidates &&
        formattedResponse.candidates.length > 0 &&
        formattedResponse.candidates[0].content &&
        formattedResponse.candidates[0].content.parts &&
        formattedResponse.candidates[0].content.parts.length > 0) {

      // Get the text content
      const textContent = formattedResponse.candidates[0].content.parts[0].text;

      // If the content doesn't already look like Markdown, format it
      if (textContent && !textContent.includes('#') && !textContent.includes('```')) {
        // Add some basic Markdown formatting
        const lines = textContent.split('\n');
        let inList = false;
        let formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();

          // Skip empty lines
          if (!line) {
            formattedLines.push('');
            inList = false;
            continue;
          }

          // Check if this looks like a header
          if (line.toUpperCase() === line && line.length < 50 && !line.endsWith(':') && i > 0 && !lines[i-1].trim()) {
            formattedLines.push(`## ${line}`);
            continue;
          }

          // Check if this looks like a subheader or category
          if (line.endsWith(':') && line.length < 50) {
            formattedLines.push(`### ${line}`);
            continue;
          }

          // Check if this looks like a list item
          if (line.match(/^[\d\-\*]\s/)) {
            formattedLines.push(line);
            inList = true;
            continue;
          }

          // Regular text
          formattedLines.push(line);
        }

        // Update the response with our formatted Markdown
        formattedResponse.candidates[0].content.parts[0].text = formattedLines.join('\n');
      }
    }

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error processing audio:', error.response?.data || error.message);

    // Check for model overload error
    if (error.response?.data?.error?.error?.code === 503 &&
        error.response?.data?.error?.error?.message?.includes('overloaded')) {
      return res.status(503).json({
        error: 'The Gemini model is currently overloaded with requests. This is a temporary issue.',
        message: 'Please try again in a few minutes. This is a common issue with popular AI models during peak usage times.',
        originalError: error.response?.data
      });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Process text endpoint for voice assistant
app.post('/gemini-text', express.json(), async (req, res) => {
  try {
    if (!req.body || !req.body.contents) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    console.log('Processing text query with Gemini...');
    console.log(`Request contents: ${JSON.stringify(req.body.contents)}`);

    // Make the API call to Gemini
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent',
      req.body,
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    console.log('Received response from Gemini');

    // Check if we got a valid response
    if (response.data) {
      // Create a compatible response format for the client
      const formattedResponse = {
        candidates: [
          {
            content: {
              parts: [
                { text: response.data.text || 'No response text available.' }
              ]
            }
          }
        ]
      };

      res.json(formattedResponse);
    } else {
      console.log('Empty response from Gemini API');
      res.json({
        candidates: [
          {
            content: {
              parts: [
                { text: 'I\'m having trouble generating a response right now. Please try again.' }
              ]
            }
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error processing text query:', error.response?.data || error.message);

    // Check for model overload error
    if (error.response?.data?.error?.error?.code === 503 &&
        error.response?.data?.error?.error?.message?.includes('overloaded')) {
      return res.status(503).json({
        error: 'The Gemini model is currently overloaded with requests. This is a temporary issue.',
        message: 'Please try again in a few minutes. This is a common issue with popular AI models during peak usage times.',
        originalError: error.response?.data
      });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Process video endpoint
app.post('/process-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log(`Processing video file: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`);

    // Convert file buffer to base64
    const videoBase64 = req.file.buffer.toString('base64');

    // Get the prompt from the request or use a default
    const prompt = req.body.prompt || 'Analyze this video. Identify key frames, objects, people, and provide a scene classification. Transcribe any speech.';

    console.log(`Using prompt: ${prompt}`);
    console.log('Making API call to Gemini...');

    // Make the API call to Gemini
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent',
      {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: videoBase64
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'text/plain'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );

    console.log('Received response from Gemini');

    // Format the response as Markdown if it's not already
    let formattedResponse = response.data;

    // Check if we have a valid response with content
    if (formattedResponse.candidates &&
        formattedResponse.candidates.length > 0 &&
        formattedResponse.candidates[0].content &&
        formattedResponse.candidates[0].content.parts &&
        formattedResponse.candidates[0].content.parts.length > 0) {

      // Get the text content
      const textContent = formattedResponse.candidates[0].content.parts[0].text;

      // If the content doesn't already look like Markdown, format it
      if (textContent && !textContent.includes('#') && !textContent.includes('```')) {
        // Add some basic Markdown formatting
        const lines = textContent.split('\n');
        let inList = false;
        let formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();

          // Skip empty lines
          if (!line) {
            formattedLines.push('');
            inList = false;
            continue;
          }

          // Check if this looks like a header
          if (line.toUpperCase() === line && line.length < 50 && !line.endsWith(':') && i > 0 && !lines[i-1].trim()) {
            formattedLines.push(`## ${line}`);
            continue;
          }

          // Check if this looks like a subheader or category
          if (line.endsWith(':') && line.length < 50) {
            formattedLines.push(`### ${line}`);
            continue;
          }

          // Check if this looks like a list item
          if (line.match(/^[\d\-\*]\s/)) {
            formattedLines.push(line);
            inList = true;
            continue;
          }

          // Regular text
          formattedLines.push(line);
        }

        // Update the response with our formatted Markdown
        formattedResponse.candidates[0].content.parts[0].text = formattedLines.join('\n');
      }
    }

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error processing video:', error.response?.data || error.message);

    // Check for model overload error
    if (error.response?.data?.error?.error?.code === 503 &&
        error.response?.data?.error?.error?.message?.includes('overloaded')) {
      return res.status(503).json({
        error: 'The Gemini model is currently overloaded with requests. This is a temporary issue.',
        message: 'Please try again in a few minutes. This is a common issue with popular AI models during peak usage times.',
        originalError: error.response?.data
      });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
