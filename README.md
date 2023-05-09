# Eclipse

:warning: **IN PROGRESS**: `Eclipse` is a discord bot containing small WoW-related utilities

## Running the project

[NodeJs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) – or any other package installer – are required in order to start the program

```bash
cd ./eclipse
npm install
```

Run the application using

```bash
npm run start
```


## Unusual node modules

- [`tsc-alias`](https://www.npmjs.com/package/tsc-alias) replaces alias paths with relative paths after typescript compilation (using `tsc`)
- [`jest-ts-webcompat-resolver`](https://www.npmjs.com/package/jest-ts-webcompat-resolver) is a jest resolver that allows [ts-jest](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/) to understand relative ESM imports using `.js` or `.ts` (instead of no extension). See this [GitHub issue](https://github.com/kulshekhar/ts-jest/issues/1057)
