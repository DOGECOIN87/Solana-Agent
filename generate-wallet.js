import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

// Generate a new random keypair
const keypair = Keypair.generate();

// Get the secret key as a Uint8Array
const secretKey = keypair.secretKey;

// Convert to array for storing in .env
const secretArray = Array.from(secretKey);

// Output public and private keys
console.log('Generated new Solana wallet:');
console.log('Public Key (address):', keypair.publicKey.toString());
console.log('Private Key JSON array saved to .env file');

// Update .env file
try {
  // Read current .env file
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Replace or add the SOLANA_PRIVATE_KEY line
  const updatedEnv = envContent.replace(
    /SOLANA_PRIVATE_KEY=.*/,
    `SOLANA_PRIVATE_KEY=[${secretArray.toString()}]`
  );
  
  // Write back the updated content
  fs.writeFileSync('.env', updatedEnv);
  
  console.log('Successfully updated .env file with new private key');
  console.log('You can now start the app with `node start.js`');
  
} catch (error) {
  console.error('Error updating .env file:', error);
}
