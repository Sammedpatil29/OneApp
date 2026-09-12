#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const APP_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.resolve(APP_DIR, '..', 'oneapp_express');
const WWW_DIR = path.join(APP_DIR, 'www');
const PACKAGE_JSON_PATH = path.join(APP_DIR, 'package.json');

const APP_ID = 'io.ionic.oneapp';
const CHANNEL = '__base__';
const RUNTIME = '__default__';

// Target backend paths
const OTA_PUBLIC_DIR = path.join(BACKEND_DIR, 'public', 'ota');
const BUNDLES_DIR = path.join(OTA_PUBLIC_DIR, 'bundles');
const MANIFEST_DIR = path.join(OTA_PUBLIC_DIR, 'manifests', APP_ID, CHANNEL, RUNTIME);
const MANIFEST_FILE = path.join(MANIFEST_DIR, 'manifest.json');

// Base CDN / API URL for bundles
const PROD_CDN_URL = process.env.OTA_CDN_URL || 'https://pintu-api.democompany.in.net/ota';
const REMOTE_API_URL = process.env.OTA_REMOTE_URL || 'https://pintu-api.democompany.in.net';
const OTA_SECRET_KEY = process.env.OTA_SECRET_KEY || 'pintu-ota-secret-key-2026';

async function main() {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--skip-build');
  const forceImmediate = args.includes('--immediate');
  const skipUpload = args.includes('--no-upload') || args.includes('--local-only');

  // Read current package.json
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  let version = args.find(arg => !arg.startsWith('--'));

  if (!version) {
    // Increment patch version if not explicitly passed
    const parts = pkg.version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    version = parts.join('.');
    console.log(`ℹ️  No version specified. Auto-incrementing to: ${version}`);
  }

  console.log(`\n========================================`);
  console.log(`🚀 Publishing Self-Hosted OTA Bundle for OneApp v${version}`);
  console.log(`========================================\n`);

  // Ensure directories exist
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
  fs.mkdirSync(MANIFEST_DIR, { recursive: true });

  // 1. Build Angular/Ionic Web Assets
  if (!skipBuild) {
    console.log('📦 Step 1/4: Building Ionic production bundle...');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execSync(`${npmCmd} run build -- --configuration=production`, {
      cwd: APP_DIR,
      stdio: 'inherit',
      shell: true
    });
  } else {
    console.log('⏩ Step 1/4: Skipping build (--skip-build requested)');
  }

  // Verify www output
  const indexPath = path.join(WWW_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`❌ www/index.html not found! Build may have failed.`);
  }

  // 2. Package www/ into zip
  const bundleFileName = `oneapp-bundle-${version}.zip`;
  const bundlePath = path.join(BUNDLES_DIR, bundleFileName);
  console.log(`\n🗜️  Step 2/4: Compressing bundle into: ${bundleFileName}...`);

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(bundlePath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(WWW_DIR, false);
    archive.finalize();
  });

  // 3. Compute SHA-256 and size
  console.log('🔒 Step 3/4: Calculating SHA-256 integrity hash...');
  const fileBuffer = fs.readFileSync(bundlePath);
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const size = fileBuffer.length;
  const sizeMb = (size / (1024 * 1024)).toFixed(2);
  const releaseId = `oneapp-rel-${version}-${Date.now().toString(36)}`;

  console.log(`   SHA-256: ${sha256}`);
  console.log(`   Size:    ${size} bytes (~${sizeMb} MB)`);
  console.log(`   Release: ${releaseId}`);

  // 4. Update manifest.json
  console.log('\n📝 Step 4/4: Updating backend manifest.json...');
  const bundleDownloadUrl = `${PROD_CDN_URL}/bundles/${bundleFileName}`;
  const manifest = {
    version: version,
    url: bundleDownloadUrl,
    sha256: sha256,
    size: size,
    releaseId: releaseId,
    strategy: 'zip',
    forceImmediate: forceImmediate
  };

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');

  // Also update package.json version in OneApp
  pkg.version = version;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ OneApp OTA Update Packaged Successfully!`);
  console.log(`----------------------------------------`);
  console.log(`• Version:      ${manifest.version}`);
  console.log(`• Manifest:     ${MANIFEST_FILE}`);
  console.log(`• Bundle:       ${bundlePath}`);
  console.log(`• Download URL: ${manifest.url}`);
  console.log(`• Policy:       ${forceImmediate ? 'Immediate Reload' : 'Apply on Next App Launch'}`);
  console.log(`----------------------------------------\n`);

  // 5. Direct Upload to Remote Server (pintu-api.democompany.in.net)
  if (!skipUpload) {
    console.log(`📡 Step 5/5: Uploading bundle & manifest directly to server: ${REMOTE_API_URL}...`);
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(bundlePath);
      const blob = new Blob([fileBuffer], { type: 'application/zip' });

      formData.append('file', blob, bundleFileName);
      formData.append('manifest', JSON.stringify(manifest));
      formData.append('appId', APP_ID);
      formData.append('channel', CHANNEL);
      formData.append('runtime', RUNTIME);
      formData.append('version', version);
      formData.append('forceImmediate', String(forceImmediate));

      const uploadUrl = `${REMOTE_API_URL}/api/ota/upload-bundle`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'x-ota-secret': OTA_SECRET_KEY
        },
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`⚠️  Remote server upload returned status ${res.status}: ${errorText}`);
        console.log(`ℹ️  Local copy remains saved in ${bundlePath}`);
      } else {
        const resData = await res.json();
        console.log(`\n🎉 REMOTE SERVER UPLOAD COMPLETED!`);
        console.log(`----------------------------------------`);
        console.log(`• Remote Status:   ${resData.message}`);
        console.log(`• Remote Bundle:   ${resData.bundleUrl}`);
        console.log(`• Remote Manifest: ${resData.manifestUrl}`);
        console.log(`• Ready for Apps:  INSTANTLY LIVE (No git commit or deploy needed!)`);
        console.log(`----------------------------------------\n`);
      }
    } catch (uploadErr) {
      console.warn(`\n⚠️  Could not connect to remote server for direct upload: ${uploadErr.message}`);
      console.log(`ℹ️  Local bundle and manifest were saved successfully to ${OTA_PUBLIC_DIR}.`);
    }
  } else {
    console.log(`⏩ Step 5/5: Skipped remote upload (--no-upload requested)`);
  }
}

main().catch(err => {
  console.error('\n❌ Publish failed:', err.message);
  process.exit(1);
});

