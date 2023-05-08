import axios from 'axios';

export namespace NetworkManager {
    export function sendGetRequest(endpointUrl: string, params: any): Promise<any> {
        return axios.get(endpointUrl, {
            params: params
        });
    }
}
