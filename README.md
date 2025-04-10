# Synthara Project

Synthara is an AI-powered platform that provides visual and content analysis, along with clean, harmonious experiences. It offers features such as blog post creation, AI image analysis, AI audio analysis, AI video analysis, YouTube video analysis, Llama4 Maverick integration, voice assistant functionality, multiple theme support, API endpoints for content processing, Google Gemini API integration, server infrastructure, and more.

--- 

## Project Structure

The project is structured as follows:

- `public/`: Contains public assets and the `CHANGELOG.md` file.
- `src/`: Contains the source code for the React application.
- `server/`: Contains the backend server code.
- `docs/`: Contains documentation files.
- `CHANGELOG.md`: The changelog file.
- `package.json`: The project's configuration file.
- `server-package.json`: The server's configuration file.

---
## Installation

To install the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/bniladridas/synthara-project.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development environment:

   ```bash
   npm run dev
   ```

This will start both the React frontend and the backend server.

---
## Available Commands

To run the project, use the scripts defined in the `package.json` file. These scripts handle development, production, and utility operations.

---

### Development

Start the development environment (both React frontend and backend server):

```bash
npm run dev
```

Start only the React frontend:

```bash
npm start
```

Start only the development server with auto-reloading:

```bash
npm run dev-server
```

---

### Production

Build the application and start the production server:

```bash
npm run prod
```

Build the application without starting the server:

```bash
npm run build
```

Start only the production server:

```bash
npm run start-prod
```

---

### Utility

Update the changelog file:

```bash
npm run update-changelog
```

Kill the development or production server manually:

```bash
npm run kill-server
```

---

## Fixing Changelog Issues

If the changelog does not display properly, follow these steps:

1. Run the changelog update script:

   ```bash
   npm run update-changelog
   ```

2. Restart the development environment:

   ```bash
   npm run dev
   ```

This triggers the `copy-changelog.js` script, which is configured to handle YAML front matter correctly. It then starts both the frontend and backend servers.

If you are only testing the changelog component:

```bash
npm start
```

---

## Attribution

Some of the content and formatting suggestions in this README are generated with assistance from [ChatGPT](https://openai.com/chatgpt) by OpenAI.