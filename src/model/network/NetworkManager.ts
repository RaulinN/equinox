import axios from 'axios';

/**
 * Send a get request
 *
 * @param endpointUrl - endpoint url to contact
 * @param params - parameters used in the GET request
 * @returns A promise containing the API's response
 */
export function sendGetRequest(endpointUrl: string, params: any): Promise<any> {
    return axios.get(endpointUrl, {
        params: params
    });
}
