const { exec } = require('child_process');

// Get the port from command line arguments or use default
const port = process.argv[2] || 3030;

console.log(`Attempting to find and kill processes on port ${port}...`);

// Command to find the process ID using the port
const findCommand = process.platform === 'win32'
  ? `netstat -ano | findstr :${port}`
  : `lsof -i :${port} | grep LISTEN`;

exec(findCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(`No process found running on port ${port}`);
    return;
  }

  if (stdout) {
    console.log(`Found process on port ${port}:`);
    console.log(stdout);

    // Extract PID based on platform
    let pid;
    if (process.platform === 'win32') {
      // Windows format: extract the last column which is the PID
      const match = stdout.match(/(\d+)$/m);
      pid = match ? match[1] : null;
    } else {
      // Unix format: extract the PID (second column)
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        pid = parts.length > 1 ? parts[1] : null;
      }
    }

    if (pid) {
      console.log(`Killing process with PID: ${pid}`);
      
      // Command to kill the process
      const killCommand = process.platform === 'win32'
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;
      
      exec(killCommand, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing process: ${killError.message}`);
          return;
        }
        console.log(`Successfully killed process on port ${port}`);
      });
    } else {
      console.log(`Could not determine PID for process on port ${port}`);
    }
  } else {
    console.log(`No process found running on port ${port}`);
  }
});
