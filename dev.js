/**
 * dev.js — Root dev launcher for ShivaMedicals
 * Starts both the server (Node/Express) and client (Vite) in parallel.
 * Run with:  node dev.js
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const isWindows = os.platform() === 'win32';

const colors = {
  server: '\x1b[36m',  // Cyan
  client: '\x1b[35m',  // Magenta
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
};

function prefix(name, color, line) {
  return `${color}${colors.bold}[${name}]${colors.reset} ${line}`;
}

function startProcess(name, color, cwd, cmd, args) {
  const proc = isWindows
    ? spawn('cmd.exe', ['/c', cmd, ...args], { cwd, env: { ...process.env } })
    : spawn(cmd, args, { cwd, env: { ...process.env } });

  proc.stdout.on('data', (data) => {
    String(data).split('\n').filter(Boolean).forEach((line) =>
      console.log(prefix(name, color, line))
    );
  });

  proc.stderr.on('data', (data) => {
    String(data).split('\n').filter(Boolean).forEach((line) =>
      console.error(prefix(name, colors.red, line))
    );
  });

  proc.on('exit', (code) => {
    if (code !== null) console.log(prefix(name, color, `Process exited with code ${code}`));
  });

  return proc;
}

console.log(`\n${colors.green}${colors.bold}╔══════════════════════════════════════╗`);
console.log(`║   Shiva Medicals — Dev Launcher      ║`);
console.log(`╚══════════════════════════════════════╝${colors.reset}\n`);
console.log(`  ${colors.server}[server]${colors.reset} → http://localhost:6001`);
console.log(`  ${colors.client}[client]${colors.reset} → http://localhost:6002\n`);

// Server: node --watch index.js
const serverProc = startProcess(
  'server',
  colors.server,
  path.join(ROOT, 'server'),
  'node',
  ['--watch', 'index.js']
);

// Client: use vite.cmd on Windows, plain vite on Unix
const viteCmd = isWindows
  ? path.join('node_modules', '.bin', 'vite.cmd')
  : path.join('node_modules', '.bin', 'vite');

const clientProc = startProcess(
  'client',
  colors.client,
  path.join(ROOT, 'client'),
  viteCmd,
  []
);

// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  console.log(`\n${colors.bold}Shutting down all processes...${colors.reset}`);
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
});
