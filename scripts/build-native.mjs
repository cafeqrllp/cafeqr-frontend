import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Safety Guard: Prevent Test App config from being injected into Production AAB!
const configContent = fs.readFileSync('capacitor.config.ts', 'utf8');
if (configContent.includes('com.cafeqr.app.test') || configContent.includes('Test Cafe')) {
  console.error("❌ CRITICAL ERROR: The Test App configuration (capacitor.config.ts) has leaked into the Production folder!");
  console.error("Build aborted to prevent Play Store corruption. Please restore the Production capacitor.config.ts.");
  process.exit(1);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_NATIVE_BUILD: 'true',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app.cafeqr.in',
  },
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
