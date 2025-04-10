const fs = require('fs');
const path = require('path');

// Paths - Check multiple possible locations for the changelog
let sourcePath = path.join(__dirname, 'docs', 'meta', 'CHANGELOG.md');
if (!fs.existsSync(sourcePath)) {
  sourcePath = path.join(__dirname, 'CHANGELOG.md');
}

// Make sure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const destPath = path.join(publicDir, 'CHANGELOG.md');

// Clean up any potential issues in the content while preserving front matter
const cleanupContent = (content) => {
  // Remove any [object Object] text that might be present
  let cleaned = content.replace(/\[object Object\]/g, '');
  return cleaned;
};

// Create fallback changelog content with front matter
const createFallbackContent = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0] + ' ' + 
                        today.toTimeString().split(' ')[0] + ' UTC';
  
  return `---
title: Documentation Changelog
version: 1.0.0
last_updated: ${formattedDate}
last_updated_by: system
security_classification: INTERNAL
review_status: APPROVED
reviewers: [system]
---

# Documentation Changelog

## Document Control
| Metadata          | Value                     |
|-------------------|---------------------------|
| Version          | 1.0.0                     |
| Last Updated     | ${formattedDate}          |
| Updated By       | system                    |
| Classification   | INTERNAL                  |
| Review Status    | APPROVED                  |
| Next Review Date | ${new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]} |

## Change History

### Version 1.0.0 (${formattedDate})
- Initial documentation setup
- Added security guidelines
- Added ethics guidelines
- Created changelog

---
Generated: ${formattedDate}
Author: system
`;
};

try {
  let changelogContent;
  
  // Check if source file exists
  if (fs.existsSync(sourcePath)) {
    console.log(`Reading changelog from: ${sourcePath}`);
    
    // Read the changelog
    changelogContent = fs.readFileSync(sourcePath, 'utf8');
    
    // Clean up the content but preserve the front matter
    changelogContent = cleanupContent(changelogContent);
    
    // Write back to the source file to ensure consistency
    fs.writeFileSync(sourcePath, changelogContent);
  } else {
    console.log(`CHANGELOG.md not found at ${sourcePath}, creating a fallback`);
    changelogContent = createFallbackContent();
    
    // Also create the source file if it doesn't exist
    const sourceDir = path.dirname(sourcePath);
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
    }
    
    fs.writeFileSync(sourcePath, changelogContent);
    console.log(`✅ Created fallback changelog at ${sourcePath}`);
  }
  
  // Copy to the public directory
  fs.writeFileSync(destPath, changelogContent);
  
  // Also copy to a location directly accessible by the frontend
  const publicDocsMetaPath = path.join(publicDir, 'docs', 'meta');
  if (!fs.existsSync(publicDocsMetaPath)) {
    fs.mkdirSync(publicDocsMetaPath, { recursive: true });
  }
  
  const publicDocsChangelog = path.join(publicDocsMetaPath, 'CHANGELOG.md');
  fs.writeFileSync(publicDocsChangelog, changelogContent);
  
  console.log(`✅ CHANGELOG.md successfully copied to:`);
  console.log(`   - ${destPath}`);
  console.log(`   - ${publicDocsChangelog}`);
} catch (err) {
  console.error('❌ Error processing CHANGELOG.md:', err);
  
  // Create a fallback changelog if none exists
  if (!fs.existsSync(destPath)) {
    console.log('Creating fallback changelog...');
    const fallbackContent = createFallbackContent();
    
    fs.writeFileSync(destPath, fallbackContent);
    console.log('✅ Created fallback CHANGELOG.md in public directory');
    
    // Also create in public/docs/meta for the component to find
    const publicDocsMetaPath = path.join(publicDir, 'docs', 'meta');
    if (!fs.existsSync(publicDocsMetaPath)) {
      fs.mkdirSync(publicDocsMetaPath, { recursive: true });
    }
    
    const publicDocsChangelog = path.join(publicDocsMetaPath, 'CHANGELOG.md');
    fs.writeFileSync(publicDocsChangelog, fallbackContent);
    console.log(`✅ Created fallback CHANGELOG.md in ${publicDocsMetaPath}`);
  }
}
