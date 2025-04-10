import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const Changelog = ({ displayMode }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const lastUpdated = '4:37 PM Thursday, 10 April 2025 (IST)';

  // Function to strip YAML front matter from markdown content
  const stripFrontMatter = (content) => {
    // Check if content starts with --- which indicates front matter
    if (content.trim().startsWith('---')) {
      // Find the closing --- and return everything after it
      const closingIndex = content.indexOf('---', 3);
      if (closingIndex !== -1) {
        return content.slice(closingIndex + 3).trim();
      }
    }
    return content;
  };

  // Apply the correct display mode
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'dim', 'gold', 'blue');

    if (displayMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (displayMode === 'dim') {
      document.documentElement.classList.add('dim');
    } else if (displayMode === 'gold') {
      document.documentElement.classList.add('gold');
    } else if (displayMode === 'blue') {
      document.documentElement.classList.add('blue');
    }
    
    // Force body background to update based on theme
    if (displayMode === 'light') {
      document.body.style.backgroundColor = 'var(--bg-light)';
      document.body.style.color = 'var(--text-light)';
    } else if (displayMode === 'dark') {
      document.body.style.backgroundColor = 'var(--bg-dark)';
      document.body.style.color = 'var(--text-dark)';
    } else if (displayMode === 'dim') {
      document.body.style.backgroundColor = 'var(--bg-dim)';
      document.body.style.color = 'var(--text-dim)';
    } else if (displayMode === 'gold') {
      document.body.style.backgroundColor = 'var(--bg-gold)';
      document.body.style.color = 'var(--text-gold)';
    } else if (displayMode === 'blue') {
      document.body.style.backgroundColor = 'var(--bg-blue)';
      document.body.style.color = 'var(--text-blue)';
    }
  }, [displayMode]);

  // Configure marked with a clean renderer that avoids object issues
  useEffect(() => {
    const renderer = new marked.Renderer();
    
    // Create safe text handling for all renderer methods
    const safeText = (text) => {
      if (typeof text !== 'string') {
        return String(text);
      }
      return text;
    };
    
    // Override heading with safe text handling
    const originalHeading = renderer.heading;
    renderer.heading = function(text, level) {
      text = safeText(text);
      return `<h${level}>${text}</h${level}>`;
    };
    
    // Override other renderer methods to ensure they handle objects properly
    const originalParagraph = renderer.paragraph;
    renderer.paragraph = function(text) {
      return originalParagraph.call(this, safeText(text));
    };
    
    const originalListitem = renderer.listitem;
    renderer.listitem = function(text) {
      return originalListitem.call(this, safeText(text));
    };
    
    marked.setOptions({
      headerIds: false,
      mangle: false,
      gfm: true,
      breaks: true,
      smartLists: true,
      smartypants: false,
      renderer: renderer
    });
  }, []);

  // Fetch and parse the changelog with retry logic
  useEffect(() => {
    const fetchChangelog = async (retryCount = 0) => {
      let debugMessages = [];
      
      try {
        setLoading(true);
        
        // Try different paths with cache busting
        const timestamp = new Date().getTime();
        const possiblePaths = [
          `/CHANGELOG.md?t=${timestamp}`,
          `/docs/meta/CHANGELOG.md?t=${timestamp}`,
          // Add absolute path from root as a fallback
          `/public/CHANGELOG.md?t=${timestamp}`
        ];
        
        let response = null;
        let currentPath = '';
        
        // Try each path until one works
        for (const path of possiblePaths) {
          try {
            currentPath = path;
            debugMessages.push(`Attempting to fetch from: ${path}`);
            
            const resp = await fetch(path, {
              method: 'GET',
              cache: 'no-store', // Force fresh fetch
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
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
          throw new Error(`Failed to fetch changelog from any known location`);
        }
        
        debugMessages.push(`Successfully loaded changelog from: ${currentPath}`);
        let text = await response.text();
        
        // Check if text is empty or invalid
        if (!text || text.trim() === '') {
          debugMessages.push('Received empty changelog content');
          throw new Error('Changelog file is empty');
        }
        
        debugMessages.push(`Changelog content length: ${text.length} characters`);
        
        // Strip YAML front matter if present
        text = stripFrontMatter(text);
        debugMessages.push('Stripped front matter from changelog content');
        
        // Ensure the correct date format in the content
        text = text.replace(
          /## \[1\.0\.0\] - .*$/m, 
          '## [1.0.0] - 4:37 PM Thursday, 10 April 2025 (IST)'
        );
        
        // Check for and fix potential object notation in the text
        text = text.replace(/\[object Object\]/g, '');
        
        try {
          debugMessages.push('Attempting to parse markdown');
          const parsedContent = marked.parse(text);
          setContent(parsedContent);
          debugMessages.push('Successfully parsed markdown');
        } catch (parseError) {
          debugMessages.push(`Error parsing markdown: ${parseError.message}`);
          // Fallback to simpler parsing
          setContent(`<pre>${text}</pre>`);
        }
        
        setLoading(false);
        setError(null);
        setDebugInfo(debugMessages.join('\n'));
      } catch (err) {
        debugMessages.push(`Error loading changelog: ${err.message}`);
        console.error('Error loading changelog:', err);
        
        // Retry logic - attempt up to 3 retries
        if (retryCount < 3) {
          debugMessages.push(`Retrying changelog fetch (${retryCount + 1}/3)...`);
          setDebugInfo(debugMessages.join('\n'));
          setTimeout(() => fetchChangelog(retryCount + 1), 1000);
          return;
        }
        
        // After retries, show fallback content
        setError('Failed to load changelog. Please try again later.');
        debugMessages.push('Using fallback content after failed retries');
        
        // Create fallback content
        const fallbackContent = `
          <h1>Changelog</h1>
          <h2>[1.0.0] - 4:37 PM Thursday, 10 April 2025 (IST)</h2>
          <h3>Added</h3>
          <ul>
            <li>Initial release</li>
            <li>Created changelog</li>
          </ul>
        `;
        
        setContent(fallbackContent);
        setLoading(false);
        setDebugInfo(debugMessages.join('\n'));
      }
    };

    fetchChangelog();
  }, []);

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

  // Calculate theme-specific background and text classes
  const getBgClass = () => {
    switch(displayMode) {
      case 'dark': return 'bg-[#080808]';
      case 'dim': return 'bg-[#1f2937]';
      case 'gold': return 'bg-[#F9E5C9]';
      case 'blue': return 'bg-[#c2d3e0]';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`max-w-3xl mx-auto my-16 px-4 ${getBgClass()}`}>
      <div className="space-y-16 text-black dark:text-white dim:text-white gold:text-black blue:text-black">
        <div>
          <p>
            This changelog documents notable changes to our platform.
          </p>
          <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] mt-4 text-sm">
            {lastUpdated}
          </p>
          {error && (
            <div className="text-red-500 mt-2">
              <p>{error}</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2 text-xs">
                  <summary>Debug information</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 overflow-auto max-h-64">
                    {debugInfo}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="changelog-content">
          {content ? (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert dim:prose-invert gold:prose-gold blue:prose-blue
                        prose-hr:hidden
                        prose-headings:font-normal prose-headings:text-black dark:prose-headings:text-white dim:prose-headings:text-white gold:prose-headings:text-black blue:prose-headings:text-black
                        prose-h1:text-xl prose-h1:mb-0
                        prose-h2:text-base prose-h2:mb-3 prose-h2:mt-6 prose-h2:font-normal
                        prose-h3:text-gray-500 dark:prose-h3:text-gray-400 dim:prose-h3:text-gray-400 gold:prose-h3:text-[#D6A756] blue:prose-h3:text-[#8aa5b9] prose-h3:font-normal prose-h3:text-sm
                        prose-p:my-2 prose-p:leading-relaxed
                        prose-ul:my-2 prose-li:my-1 prose-li:marker:text-gray-400
                        prose-a:text-black dark:prose-a:text-white dim:prose-a:text-white gold:prose-a:text-black blue:prose-a:text-black
                        prose-a:no-underline hover:prose-a:text-gray-500 dark:hover:prose-a:text-gray-400 dim:hover:prose-a:text-gray-400 hover:gold:prose-a:text-[#D6A756] hover:blue:prose-a:text-[#8aa5b9]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-red-500">No changelog content available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Changelog;
