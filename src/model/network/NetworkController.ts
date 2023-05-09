import { ClientRio } from './client/ClientRio.js';
import { PlayerInfoRio } from './PlayerInfoRio.js';
import { logger } from '@logger/Logger.js';

export class NetworkController {
    readonly #clientRio: ClientRio;
    // readonly clientWlogs: ClientWlogs;

    constructor() {
        this.#clientRio = new ClientRio();
    }

    getPlayerInfo(name: string, realm: string = 'Dalaran', region: string = 'eu'): Promise<PlayerInfoRio> {
        // TODO add query for wlogs
        logger.info(`Sending a GET request for name='${name}', realm='${realm}', and region='${region}'`);
        return this.#clientRio.fetchPlayerInfo(name, realm, region);
    }
}
