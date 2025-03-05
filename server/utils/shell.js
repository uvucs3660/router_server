const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Execute a shell command and return the result
async function execute(command, options = {}) {
  try {
    const { stdout, stderr } = await execPromise(command, options);
    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.trim(),
      stdout: error.stdout?.trim()
    };
  }
}

// Execute a command with real-time output handling
function executeStream(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const result = {
      stdout: '',
      stderr: '',
      code: null
    };
    
    const child = spawn(command, args, options);
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      result.stdout += output;
      
      if (options.onStdout) {
        options.onStdout(output);
      }
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      result.stderr += output;
      
      if (options.onStderr) {
        options.onStderr(output);
      }
    });
    
    child.on('close', (code) => {
      result.code = code;
      
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
    
    child.on('error', (error) => {
      result.error = error;
      reject(result);
    });
  });
}

// Check if a command exists in the system
async function commandExists(command) {
  try {
    await execPromise(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  execute,
  executeStream,
  commandExists
};