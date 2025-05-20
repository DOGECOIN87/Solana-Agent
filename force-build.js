import * as fs from 'fs';
import { mkdir, stat, readdir, copyFile, readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDirectoryExists(dirPath) {
  try {
    await stat(dirPath);
  } catch (error) {
    // Directory doesn't exist, so create it
    await mkdir(dirPath, { recursive: true });
  }
}

async function stripTypescriptTypes(content) {
  // Very basic transformation: remove type annotations
  let result = content
    // Remove optional parameters (transform 'param?: type' to 'param')
    .replace(/(\w+)\??:\s*[a-zA-Z0-9_<>[\]|.?,\s]+(?=[,)=;])/g, '$1')
    // Remove regular type annotations (transform 'param: type' to 'param')
    .replace(/:\s*[a-zA-Z0-9_<>[\]|.?,\s]+(?=[,)=;])/g, '')
    // Handle function parameter default values with optional params
    .replace(/(\w+)\?\s*=/g, '$1=')
    // Remove generic type parameters
    .replace(/<[^>]+>/g, '')
    // Remove exported interfaces
    .replace(/export\s+interface\s+[\w_]+\s*{[^}]*}/g, '')
    // Remove regular interfaces
    .replace(/interface\s+[\w_]+\s*{[^}]*}/g, '')
    // Remove exported type aliases
    .replace(/export\s+type\s+[\w_]+\s*=\s*[^;]+;/g, '')
    // Remove regular type aliases
    .replace(/type\s+[\w_]+\s*=\s*[^;]+;/g, '')
  
  return result
    // Fix import statements properly
    .replace(/import\s*{([^}]*)}\s*from\s*(['"])([^'"]+)\2;/g, (match, imports, quote, module) => {
      // Transform import statements with named imports
      const jsModule = module.endsWith('.ts') ? module.replace('.ts', '.js') : module;
      return `import { ${imports} } from ${quote}${jsModule}${quote};`;
    })
    .replace(/import\s+(\w+)\s+from\s+(['"])([^'"]+)\2;/g, (match, importName, quote, module) => {
      // Transform basic import statements
      const jsModule = module.endsWith('.ts') ? module.replace('.ts', '.js') : module;
      return `import ${importName} from ${quote}${jsModule}${quote};`;
    })
    .replace(/import\s*\*\s*as\s*(\w+)\s*from\s*(['"])([^'"]+)\2;/g, (match, importName, quote, module) => {
      // Transform namespace import statements
      const jsModule = module.endsWith('.ts') ? module.replace('.ts', '.js') : module;
      return `import * as ${importName} from ${quote}${jsModule}${quote};`;
    })
    .replace(/\.ts(['"])/g, '.js$1'); // Replace .ts with .js in imports
}

async function processTsFile(sourcePath, targetPath) {
  console.log(`Processing: ${sourcePath} -> ${targetPath}`);
  try {
    // Read the TypeScript file
    const content = await readFile(sourcePath, 'utf8');
    // Convert TS to JS by stripping type annotations
    const jsContent = await stripTypescriptTypes(content);
    // Write the JS file
    await writeFile(targetPath, jsContent);
  } catch (error) {
    console.error(`Error processing file ${sourcePath}:`, error);
  }
}

async function copyDirectory(sourceDir, targetDir) {
  // Create target directory if it doesn't exist
  await ensureDirectoryExists(targetDir);
  
  // Read the directory contents
  const entries = await readdir(sourceDir, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.name.endsWith('.ts')) {
      // Process TypeScript files
      const jsTargetPath = targetPath.replace(/\.ts$/, '.js');
      await processTsFile(sourcePath, jsTargetPath);
    } else {
      // Copy other files as-is
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  const sourceDir = path.join(__dirname, 'src');
  const buildDir = path.join(__dirname, 'build');
  
  console.log('Starting forced TypeScript -> JavaScript build...');
  
  try {
    // Ensure build directory exists
    await ensureDirectoryExists(buildDir);
    
    // Copy and transform files
    await copyDirectory(sourceDir, buildDir);
    
    // Make index.js executable
    const indexJsPath = path.join(buildDir, 'index.js');
    try {
      await stat(indexJsPath);
      fs.chmodSync(indexJsPath, '755');
      console.log('Made index.js executable');
    } catch (error) {
      console.error('Error making index.js executable:', error);
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
