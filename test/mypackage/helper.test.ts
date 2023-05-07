const hey = require('@my/helper').hey;

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

test('test hey', () => {
    expect(hey).toBe('hi mom!');
});
