import fs from 'fs';
import path from 'path';

/**
 * Load a fixture file and parse it as JSON
 * @param fixturePath Path relative to the __fixtures__ directory
 * @returns Parsed fixture data
 */
export async function loadFixture<T>(fixturePath: string): Promise<T> {
    const fullPath = path.join(process.cwd(), 'src/tests/__fixtures__', fixturePath);
    const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent) as T;
}

/**
 * Load a fixture file synchronously and parse it as JSON
 * @param fixturePath Path relative to the __fixtures__ directory
 * @returns Parsed fixture data
 */
export function loadFixtureSync<T>(fixturePath: string): T {
    const fullPath = path.join(process.cwd(), 'src/tests/__fixtures__', fixturePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent) as T;
}
