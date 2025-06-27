#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateCanisterIds() {
  try {
    console.log('Extracting canister IDs from dfx...');

    // Get dfx.json canisters
    const dfxJsonPath = join(__dirname, '..', 'dfx.json');
    const dfxJson = JSON.parse(execSync(`cat ${dfxJsonPath}`, { encoding: 'utf8' }));
    
    const canisterIds = {};
    
    // Extract canister IDs
    for (const [canisterName] of Object.entries(dfxJson.canisters)) {
      try {
        // Try to get the canister ID from dfx
        const result = execSync(`dfx canister id ${canisterName} 2>/dev/null || echo ""`, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
        }).trim();
        
        if (result && result !== '') {
          canisterIds[canisterName] = result;
          console.log(`${canisterName}: ${result}`);
        } else {
          console.log(`${canisterName}: Not deployed`);
        }
      } catch (error) {
        console.log(`${canisterName}: Not accessible`);
      }
    }

    // Generate the configuration file
    const outputPath = join(__dirname, '..', 'src', 'pico_frontend', 'src', 'config', 'generated-canister-ids.json');
    
    const config = {
      generated_at: new Date().toISOString(),
      network: process.env.DFX_NETWORK || 'local',
      canister_ids: canisterIds
    };

    writeFileSync(outputPath, JSON.stringify(config, null, 2));
    
    console.log(`Generated canister configuration at: ${outputPath}`);
    console.log(`Found ${Object.keys(canisterIds).length} deployed canisters`);
    
    // Also update .env file
    const envPath = join(__dirname, '..', '.env');
    let envContent = '';
    
    try {
      envContent = execSync(`cat ${envPath}`, { encoding: 'utf8' });
    } catch (error) {
      console.log('Creating new .env file');
    }

    // Remove existing canister ID entries
    const envLines = envContent.split('\n').filter(line => 
      !line.startsWith('CANISTER_ID_') && line.trim() !== ''
    );
    
    // Add new canister IDs
    Object.entries(canisterIds).forEach(([name, id]) => {
      const envKey = `CANISTER_ID_${name.toUpperCase()}`;
      envLines.push(`${envKey}=${id}`);
    });
    
    writeFileSync(envPath, envLines.join('\n') + '\n');
    console.log('Updated .env file with canister IDs');

  } catch (error) {
    console.error('Error generating canister IDs:', error.message);
    process.exit(1);
  }
}

generateCanisterIds(); 