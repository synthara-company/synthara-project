import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';

const ConsolidatedChangelog = ({ displayMode }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const lastUpdated = 'April 10, 2025';

  // Function to strip YAML front matter from markdown content
  const stripFrontMatter = (txt) => {
    if (txt.trim().startsWith('---')) {
      const closingIndex = txt.indexOf('---', 3);
      if (closingIndex !== -1) {
        return txt.slice(closingIndex + 3).trim();
      }
    }
    return txt;
  };

  // Wrap fetchChangelog in useCallback so that it doesn't warn about missing dependency
  const fetchChangelog = useCallback(async (retryCount = 0) => {
    let debugMessages = [];
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      // Remove the /public/ path because files in public are served from the root
      const possiblePaths = [
        `/CHANGELOG.md?t=${timestamp}`,
        `/docs/meta/CHANGELOG.md?t=${timestamp}`
      ];
      
      debugMessages.push('Starting fetch of changelog...');
      let response = null;
      let currentPath = '';

      for (const path of possiblePaths) {
        try {
          currentPath = path;
          debugMessages.push(`Attempting to fetch from: ${path}`);
          const resp = await fetch(path, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          if (resp.ok) {
            response = resp;
            debugMessages.push(`Successfully fetched from: ${path}`);
            break;
          } else {
            debugMessages.push(`Failed to fetch from ${path}, status: ${resp.status}`);
          }
        } catch (e) {
          debugMessages.push(`Error fetching from ${path}: ${e.message}`);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch changelog from any known location');
      }

      debugMessages.push(`Loading changelog from: ${currentPath}`);
      let text = await response.text();

      // Check if the fetched content is HTML (which typically indicates an error response)
      if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
        debugMessages.push('Fetched content appears to be HTML rather than markdown.');
        throw new Error('Received HTML content instead of the changelog markdown.');
      }

      if (!text || text.trim() === '') {
        debugMessages.push('Received empty changelog content');
        throw new Error('Changelog file is empty');
      }

      text = stripFrontMatter(text);
      // Update the version date using flexible regex patterns to handle various formats
      // This handles formats like "## [1.0.0] - <date>" or "## Version 1.0.0 (<date>)"
      text = text.replace(/## \[1\.0\.0\] - .*$/m, '## [1.0.0] - April 10, 2025');
      text = text.replace(/(## Version\s+1\.0\.0\s*\(?)[^)]+\)?/i, '$1April 10, 2025)');
      text = text.replace(/(Version\s+1\.0\.0\s*\(?)[^)]+\)?/i, '$1April 10, 2025)');
      text = text.replace(/\[object Object\]/g, '');

      try {
        debugMessages.push('Attempting to parse markdown content');
        const parsedContent = marked.parse(text);
        setContent(parsedContent);
        debugMessages.push('Successfully parsed markdown');
      } catch (parseError) {
        debugMessages.push(`Error parsing markdown: ${parseError.message}`);
        setContent(`<pre>${text}</pre>`);
      }

      setLoading(false);
      setError(null);
      setDebugInfo(debugMessages.join('\n'));
    } catch (err) {
      debugMessages.push(`Error loading changelog: ${err.message}`);
      console.error('Error loading changelog:', err);
      if (retryCount < 3) {
        debugMessages.push(`Retrying changelog fetch (${retryCount + 1}/3)...`);
        setDebugInfo(debugMessages.join('\n'));
        setTimeout(() => fetchChangelog(retryCount + 1), 1000);
        return;
      }
      // After retries fail, use fallback content that includes the design principles
      setError('Failed to load changelog. Please try again later.');
      const fallbackContent = `
        <h1>Changelog</h1>
        <h2>Version 1.0.0 (April 10, 2025)</h2>
        <h3>Added</h3>
        <ul>
          <li>Initial release</li>
          <li>Created changelog</li>
          <li>Typography to create a cleaner, more harmonious visual experience with no noise</li>
          <li>Cleaner, more focused user interface with no redundancy</li>
          <li>Creates no visual noise</li>
          <li>Further refine the typography and interface to create an even cleaner, more harmonious visual experience with absolutely no noise or redundancy</li>
        </ul>
      `;
      setContent(fallbackContent);
      setLoading(false);
      setDebugInfo(debugMessages.join('\n'));
    }
  }, []);

  useEffect(() => {
    fetchChangelog();
  }, [fetchChangelog]);

  // Apply display mode: set class on html element for theming
  useEffect(() => {
    // Clear any existing mode classes before adding the new one
    document.documentElement.classList.remove('light', 'dark', 'dim', 'gold', 'blue');
    document.documentElement.classList.add(displayMode);
  }, [displayMode]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-16 px-4">
        <div className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">
          <p>Loading changelog...</p>
          <div className="mt-2 w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-16 px-4">
      <div className="space-y-16 text-black dark:text-white dim:text-white gold:text-black blue:text-black">
        <div>
          <p>This changelog documents notable changes to our platform.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">{lastUpdated}</p>
          {error && (
            <div className="text-red-500 mt-2">
              <p>{error}</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-xs">
                  <summary>Debug information</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 dim:bg-gray-800 gold:bg-amber-50 blue:bg-blue-50 overflow-auto max-h-64">
                    {debugInfo}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="changelog-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default ConsolidatedChangelog;
