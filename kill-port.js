/**
 * Kill process on port 5000
 * Run: node kill-port.js
 */
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function killPort(port) {
  try {
    console.log(`🔍 Finding process on port ${port}...`);
    
    // Windows command to find PID
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    
    if (!stdout.trim()) {
      console.log(`✅ No process found on port ${port}`);
      return;
    }

    // Extract PID from output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    });

    if (pids.size === 0) {
      console.log(`✅ No process found on port ${port}`);
      return;
    }

    console.log(`📋 Found ${pids.size} process(es) on port ${port}:`);
    pids.forEach(pid => console.log(`   PID: ${pid}`));

    // Kill each process
    for (const pid of pids) {
      try {
        console.log(`🛑 Killing process ${pid}...`);
        await execPromise(`taskkill /PID ${pid} /F`);
        console.log(`✅ Process ${pid} killed successfully`);
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log(`⚠️  Process ${pid} already terminated`);
        } else {
          console.error(`❌ Error killing process ${pid}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Port ${port} is now free!`);
    console.log(`   You can now run: npm run dev`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual steps:');
    console.log(`   1. Run: netstat -ano | findstr :${port}`);
    console.log(`   2. Note the PID (last column)`);
    console.log(`   3. Run: taskkill /PID <PID> /F`);
  }
}

const port = process.argv[2] || 5000;
killPort(port);

