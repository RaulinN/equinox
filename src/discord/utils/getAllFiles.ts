import fs from 'fs';
import path from 'path';

/**
 * Generate the list of all files (or folders) in the specified directory
 *
 * @param directory - where the files are located
 * @param foldersOnly - returns folders only iff true
 *
 * @note this function omits ".map" files
 */
export function getAllFiles(directory: any, foldersOnly: boolean = false): string[] {
    let fileNames: string[] = [];

    // check whether the directory exists already
    if (!fs.existsSync(directory)) {
        return [];
    }

    // read all files/directories inside the dir directory
    const files = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
        const filePath: string = path.join(directory, file.name);

        if (foldersOnly) {
            if (file.isDirectory()) {
                fileNames.push(filePath);
            }
        } else {
            if (file.isFile() && !file.name.endsWith(".map")) {
                fileNames.push(filePath);
            }
        }
    }

    return fileNames;
}
