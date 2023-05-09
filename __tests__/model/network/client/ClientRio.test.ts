import { ClientRio } from '@src/model/network/client/ClientRio.js';

describe('testing raider io client', () => {
    const client = new ClientRio();

    test('should return player info for existing player', () => {
        return expect(
            client.fetchPlayerInfo('Myrxia', 'Dalaran', 'eu')
        ).resolves.toHaveProperty('name', 'Myrxia');
    });

    test('should return error json for non-existing player', () => {
        return expect(
            client.fetchPlayerInfo('not-myrxia', 'Dalaran', 'eu')
        ).rejects.toHaveProperty('error');
    });
});
