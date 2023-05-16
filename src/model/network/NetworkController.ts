import { ClientRio } from './client/ClientRio.js';
import { PlayerInfoRio } from './PlayerInfoRio.js';
import { logger } from '../../logger/Logger.js';

/** NetworkController is the entity that handles any in/out-going network requests */
export class NetworkController {
    /** RaiderIO client @readonly */
    readonly #clientRio: ClientRio;
    // readonly clientWlogs: ClientWlogs;

    constructor() {
        this.#clientRio = new ClientRio();
    }

    /**
     * Fetch player information
     *
     * @param name - name of the player
     * @param realm - realm of the player
     * @param region - region of the player
     * @returns The player information in the form of a Promise containing {@link PlayerInfoRio}
     */
    getPlayerInfo(name: string, realm: string = 'Dalaran', region: string = 'eu'): Promise<PlayerInfoRio> {
        // TODO add query for wlogs
        logger.info(`Sending a GET request for name='${name}', realm='${realm}', and region='${region}'`);
        return this.#clientRio.fetchPlayerInfo(name, realm, region);
    }
}
