const fs = require('fs/promises');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);

// Ensure a directory exists
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Check if a file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

// Get file size in readable format
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const bytes = stats.size;
    
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  } catch (error) {
    console.error('Error getting file size:', error);
    return null;
  }
}

// Get file metadata
async function getFileMetadata(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let mimeType = 'application/octet-stream';
    
    // Basic MIME type mapping
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    };
    
    if (mimeTypes[ext]) {
      mimeType = mimeTypes[ext];
    }
    
    return {
      name: path.basename(filePath),
      path: filePath,
      extension: ext,
      mimeType,
      size: stats.size,
      sizeReadable: await getFileSize(filePath),
      created: stats.birthtime,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

// List directory contents with metadata
async function listDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const result = [];
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const metadata = await getFileMetadata(filePath);
      
      if (metadata) {
        result.push(metadata);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error listing directory:', error);
    return [];
  }
}

module.exports = {
  ensureDirectory,
  fileExists,
  getFileSize,
  getFileMetadata,
  listDirectory
};