#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_DIR = path.resolve(__dirname, '..');

const targetEnv = (process.argv[2] || 'prod').toLowerCase();
const isTesting = targetEnv === 'testing' || targetEnv === 'test' || targetEnv === 'dev';

const TEST_CDN_URL = 'https://oneapp-express-singapore.onrender.com/ota';
const PROD_CDN_URL = 'https://pintu-api.democompany.in.net/ota';

const activeCdnUrl = isTesting ? TEST_CDN_URL : PROD_CDN_URL;
const envLabel = isTesting ? 'TESTING (Render)' : 'PRODUCTION (Pintu API)';

console.log(`🔧 Setting Capacitor environment to: ${envLabel}`);
console.log(`📡 OTA CDN URL: ${activeCdnUrl}`);

// 1. Update capacitor.config.json if it exists
const jsonPath = path.join(APP_DIR, 'capacitor.config.json');
if (fs.existsSync(jsonPath)) {
  try {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (!jsonContent.plugins) jsonContent.plugins = {};
    if (!jsonContent.plugins.OtaKit) jsonContent.plugins.OtaKit = {};
    jsonContent.plugins.OtaKit.cdnUrl = activeCdnUrl;
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2) + '\n', 'utf-8');
    console.log(`✅ Updated capacitor.config.json`);
  } catch (err) {
    console.warn(`⚠️ Failed to update capacitor.config.json:`, err.message);
  }
}

// 2. Update capacitor.config.ts
const tsPath = path.join(APP_DIR, 'capacitor.config.ts');
if (fs.existsSync(tsPath)) {
  try {
    let tsContent = fs.readFileSync(tsPath, 'utf-8');
    tsContent = tsContent.replace(
      /cdnUrl:\s*['"][^'"]+['"]/g,
      `cdnUrl: '${activeCdnUrl}'`
    );
    fs.writeFileSync(tsPath, tsContent, 'utf-8');
    console.log(`✅ Updated capacitor.config.ts`);
  } catch (err) {
    console.warn(`⚠️ Failed to update capacitor.config.ts:`, err.message);
  }
}

console.log(`🎉 Environment configured successfully for ${targetEnv}!\n`);

