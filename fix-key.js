// Quick script to convert a base58 private key string to a JSON array of bytes
// This is a simple helper script for debugging

function stringToArray(str) {
  return Array.from(str).map(c => c.charCodeAt(0));
}

// Sample private key (replace this with your actual key)
const privateKey = "2Asfds5Uvr8p2fZ8CsksXq5S7fJtr6VGGvXVzUXK284viiCWHgTqq1QKoQKWQZFqHx3tFRSXtiA6Fwpxq3pHx6Me";

// Convert to array of byte values
const keyArray = stringToArray(privateKey);

// Print as JSON array
console.log(JSON.stringify(keyArray));
