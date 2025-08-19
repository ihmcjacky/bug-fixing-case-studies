const fs = require('fs');
const path = require('path');

// Read the built index.html file
const indexPath = path.join(__dirname, 'build', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Add a build timestamp as a comment to force cache invalidation
const buildTimestamp = Date.now();
const timestampComment = `<!-- Build: ${buildTimestamp} -->`;

// Remove any existing build timestamps first (handle both formatted and minified HTML)
// This regex handles various whitespace patterns and multiple timestamps
indexContent = indexContent.replace(/<!--\s*Build:\s*\d+\s*-->\s*/g, '');

// Insert the timestamp at the beginning of the head section
indexContent = indexContent.replace(
  '<head>',
  `<head>${timestampComment}`
);

// Write the modified content back
fs.writeFileSync(indexPath, indexContent);

console.log(`Added build timestamp: ${buildTimestamp}`);
