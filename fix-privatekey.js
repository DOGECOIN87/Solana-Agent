import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as bs58 from 'bs58';

// Load environment variables from .env file
dotenv.config();

try {
  console.log('Fixing private key format in .env file...');
  
  // Get the current private key from environment
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('Error: SOLANA_PRIVATE_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('Private key found in .env file');
  
  // Try to decode it from base58 format
  let decodedKey;
  try {
    decodedKey = bs58.decode(privateKey);
  } catch (error) {
    console.error('Error decoding private key:', error.message);
    console.log('Key might already be in another format. Continuing anyway...');
  }
  
  // Create the JSON array
  let jsonKey;
  if (decodedKey) {
    jsonKey = JSON.stringify(Array.from(decodedKey));
  } else {
    // If we couldn't decode, just wrap the key in quotes
    jsonKey = `"${privateKey}"`;
  }
  
  // Read the current .env file
  const envFile = fs.readFileSync('.env', 'utf8');
  
  // Replace the SOLANA_PRIVATE_KEY line
  const updatedEnv = envFile.replace(
    /SOLANA_PRIVATE_KEY=.*/,
    `SOLANA_PRIVATE_KEY=${jsonKey}`
  );
  
  // Write the updated .env file
  fs.writeFileSync('.env', updatedEnv, 'utf8');
  
  console.log('Successfully updated private key format in .env file');
  console.log('You can now run the app with `npm start`');
  
} catch (error) {
  console.error('An error occurred:', error);
  process.exit(1);
}
