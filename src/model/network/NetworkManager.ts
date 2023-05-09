import axios from 'axios';

export function sendGetRequest(endpointUrl: string, params: any): Promise<any> {
    return axios.get(endpointUrl, {
        params: params
    });
}
