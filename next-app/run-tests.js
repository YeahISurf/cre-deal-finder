// JavaScript test runner for CRE Deal Finder tests
// This is an alternative to run-tests.sh for environments where shell scripts can't be run

const { exec, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if the server is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    const testConnection = exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3003');
    
    testConnection.on('exit', (code, signal) => {
      if (code === 0) {
        console.log("Next.js server is already running on port 3003");
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Start the Next.js server
function startServer() {
  return new Promise((resolve) => {
    console.log("Starting Next.js server on port 3003...");
    
    const server = spawn('npm', ['run', 'dev', '--', '-p', '3003'], {
      detached: true,
      stdio: 'inherit'
    });
    
    // Store the server process ID
    global.serverPid = server.pid;
    
    // Wait a moment for the server to start
    setTimeout(() => {
      console.log("Server should be starting. Waiting for it to be ready...");
      
      // Check every second if the server is up
      const interval = setInterval(() => {
        const testConnection = exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3003');
        
        testConnection.on('exit', (code, signal) => {
          if (code === 0) {
            clearInterval(interval);
            console.log("Server started successfully!");
            resolve();
          }
        });
      }, 1000);
    }, 3000);
  });
}

// Run the selected tests
function runTests(choice) {
  return new Promise((resolve) => {
    let testCommand;
    
    switch(choice) {
      case '1':
        console.log("Running comprehensive tests...");
        testCommand = exec('node test-comprehensive.js');
        break;
      case '2':
        console.log("Running edge case tests...");
        testCommand = exec('node test-edge-cases.js');
        break;
      case '3':
        console.log("Running comprehensive tests...");
        const test1 = exec('node test-comprehensive.js');
        
        test1.stdout.pipe(process.stdout);
        test1.stderr.pipe(process.stderr);
        
        test1.on('exit', () => {
          console.log("\n\nRunning edge case tests...");
          const test2 = exec('node test-edge-cases.js');
          
          test2.stdout.pipe(process.stdout);
          test2.stderr.pipe(process.stderr);
          
          test2.on('exit', () => {
            resolve();
          });
        });
        
        return; // Return early since we're handling this case differently
      default:
        console.log("Invalid choice. Running comprehensive tests by default...");
        testCommand = exec('node test-comprehensive.js');
    }
    
    // Pipe the output to the console
    testCommand.stdout.pipe(process.stdout);
    testCommand.stderr.pipe(process.stderr);
    
    testCommand.on('exit', () => {
      resolve();
    });
  });
}

// Stop the server if we started it
function stopServer() {
  return new Promise((resolve) => {
    if (global.serverPid) {
      rl.question("Tests completed. Stop the Next.js server? (y/n): ", (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log("Stopping Next.js server...");
          
          try {
            process.kill(-global.serverPid);
            console.log("Server stopped.");
          } catch (e) {
            console.log("Error stopping server:", e.message);
            console.log("You may need to stop the server manually.");
          }
        } else {
          console.log("Server is still running on port 3003. Remember to stop it manually when done.");
        }
        
        resolve();
      });
    } else {
      console.log("Tests completed. The Next.js server was already running and will continue to run.");
      resolve();
    }
  });
}

// Main function
async function main() {
  console.log("CRE Deal Finder Test Runner");
  console.log("===========================");
  
  // Check if server is running
  const serverRunning = await checkServerRunning();
  
  // Start server if needed
  if (!serverRunning) {
    await startServer();
  }
  
  // Ask which tests to run
  rl.question("\nWhich tests would you like to run?\n" +
              "1. Comprehensive tests (standard property types)\n" +
              "2. Edge case tests (unusual property scenarios)\n" +
              "3. Both comprehensive and edge case tests\n" +
              "Enter your choice (1-3): ", async (choice) => {
    
    // Run the selected tests
    await runTests(choice);
    
    // Stop the server if we started it
    await stopServer();
    
    // Close the readline interface
    rl.close();
  });
}

// Run the main function
main().catch(console.error);
