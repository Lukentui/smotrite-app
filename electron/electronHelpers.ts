import { app } from "electron"

/**
 * Retrieves the application version and formats it to be safe for use in filenames or URLs.
 * 
 * The version string is transformed by replacing all non-alphanumeric characters with underscores
 * and converting the entire string to lowercase.
 * 
 * @example v1.3.9 => v1_3_9
 * @returns {string} The formatted application version string.
 */
const getSafeAppVersion = (): string => {
    return app.getVersion()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
}

export { getSafeAppVersion }