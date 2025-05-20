import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = path.join(__dirname, 'user-settings.json');

/**
 * Load user settings from the settings file
 * @returns User settings object
 */
export async function loadSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty settings
    return {};
  }
}

/**
 * Save user settings to the settings file
 * @param settings Settings object to save
 */
export async function saveSettings(settings) {
  try {
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings');
  }
}

/**
 * Check if a specific setting key exists in the saved settings
 * @param key Setting key to check
 * @returns True if the setting exists and has a value
 */
export async function hasSetting(key) {
  const settings = await loadSettings();
  return !!settings[key];
}

/**
 * Get a specific setting value
 * @param key Setting key to get
 * @returns The setting value or undefined if not found
 */
export async function getSetting(key) {
  const settings = await loadSettings();
  return settings[key];
}
