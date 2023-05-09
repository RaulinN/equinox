# Equinox

:warning: **IN PROGRESS**: `Equinox` is a discord bot containing small WoW-related utilities

## Running the project

[NodeJs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) – or any other package installer – are required in order to start the program

```bash
cd ./equinox
npm install
```

Then, a [discord bot token]() should be generated and stored inside the `.env` file (`touch .env`). Its content should be formatted as follows

```
DISCORD_BOT_TOKEN=<your_bot_token>
```

Finally, run the application using

```bash
npm run start
```


## Unusual node modules

- [`tsc-alias`](https://www.npmjs.com/package/tsc-alias) replaces alias paths with relative paths after typescript compilation (see [this post](https://stackoverflow.com/questions/59179787/tsc-doesnt-compile-alias-paths))
- [`jest-ts-webcompat-resolver`](https://www.npmjs.com/package/jest-ts-webcompat-resolver) is a jest resolver that allows [ts-jest](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/) to understand relative ESM imports using `.js` or `.ts` (instead of no extension). See this [GitHub issue](https://github.com/kulshekhar/ts-jest/issues/1057)


## Credits

Code related to [`discord.js`](https://discord.js.org/) is heavily inspired from [Under Ctrl YouTube videos](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es)
