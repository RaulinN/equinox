import { sendGetRequest } from '@src/model/network/index.js';

test('get request', () => {
    return expect(
        sendGetRequest('https://jsonplaceholder.typicode.com/todos/1', {})
            .then(r => r.data)
    ).resolves.toHaveProperty('id', 1)
});
