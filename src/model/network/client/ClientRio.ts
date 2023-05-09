import { PlayerInfoRio } from '../PlayerInfoRio.js';
import { IClient } from './IClient.js';
import { sendGetRequest } from '../NetworkManager.js';

export class ClientRio implements IClient {
    API_BASE_URL: string = "https://raider.io/api/v1";

    fetchPlayerInfo(name: string, realm: string, region: string): Promise<PlayerInfoRio> {
        return sendGetRequest(`${this.API_BASE_URL}/characters/profile`, {
            region, realm, name,
            fields: 'gear,guild,raid_progression,mythic_plus_scores_by_season:season-df-1:current',
        })
        .then((r: any) => r.data as PlayerInfoRio)
        .catch((r: any) => Promise.reject(r.response.data));
    }
}
