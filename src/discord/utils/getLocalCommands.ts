import path from 'path';
import { getAllFiles } from './getAllFiles.js';
import { fileURLToPath } from 'url';
import { ICommand } from '../commands/ICommand.js';
import { logger } from '../../logger/Logger.js';

/**
 * Fetch local commands (defined in '../commands')
 *
 * @param exceptions - commands to exclude
 */
export async function getLocalCommands(exceptions: any[] = []): Promise<ICommand[]> {
    let localCommands: ICommand[] = [];

    const dirName: string = path.dirname(fileURLToPath(import.meta.url));
    const commandCategories: string[] = getAllFiles(
        path.join(dirName, '..', 'commands'),
        true
    );

    // loop over all the command categories (folders children of '../commands')
    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {

            const myModule = await import(commandFile);
            // note: this will not be undefined. Typescript does not trust me tho
            const command: string | undefined = commandFile!.split('/').pop()?.split('.')[0];
            if (!command) {
                logger.error(
                    `${getLocalCommands.name} found command '${command}' from '${commandFile}' which should never be undefined`
                );
            } else {
                const commandObject: ICommand = myModule[command]

                if (!exceptions.includes(commandObject.name)) {
                    localCommands.push(commandObject);
                }
            }
        }
    }

    return localCommands;
}
