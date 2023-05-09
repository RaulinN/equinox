import { PlayerInfoRio } from '../PlayerInfoRio.js';
import { IClient } from './IClient.js';
import { sendGetRequest } from '../NetworkManager.js';

/** A ClientRio handles communication with raider.io */
export class ClientRio implements IClient {
    API_BASE_URL: string = "https://raider.io/api/v1";

    /**
     * Fetch raider.io player information
     *
     * @param name - name of the player
     * @param realm - realm of the player
     * @param region - region of the player
     * @returns The player information in the form of a Promise containing {@link PlayerInfoRio}
     */
    fetchPlayerInfo(name: string, realm: string, region: string): Promise<PlayerInfoRio> {
        return sendGetRequest(`${this.API_BASE_URL}/characters/profile`, {
            region, realm, name,
            fields: 'gear,guild,raid_progression,mythic_plus_scores_by_season:season-df-1:current',
        })
        .then((r: any) => r.data as PlayerInfoRio)
        .catch((r: any) => Promise.reject(r.response.data));
    }
}
