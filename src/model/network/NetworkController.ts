import { ClientRio } from './client/ClientRio.js';
import { PlayerInfoRio } from './PlayerInfoRio.js';

export class NetworkController {
    readonly #clientRio: ClientRio;
    // readonly clientWlogs: ClientWlogs;

    constructor() {
        this.#clientRio = new ClientRio();
    }

    getPlayerInfo(name: string, realm: string = 'Dalaran', region: string = 'eu'): Promise<PlayerInfoRio> {
        // TODO add query for wlogs
        return this.#clientRio.fetchPlayerInfo(name, realm, region);
    }
}
