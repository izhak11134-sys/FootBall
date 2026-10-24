import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normaliseProducts } from '../src/catalog.js';
const file=process.argv[2];
if(!file){console.error('Usage: npm run catalog:import -- /path/to/exported-catalog.json');process.exit(1);}
const products=normaliseProducts(JSON.parse(await readFile(resolve(file),'utf8')));
await writeFile(new URL('../src/products.json',import.meta.url),JSON.stringify({version:1,products},null,2)+'\n');
console.log(`Imported ${products.length} items into the project catalogue. Run the build and tests before publishing.`);
