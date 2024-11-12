## Getting Started

First, run the development server:

```bash
yarn install
yarn dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup/index.tsx`. It should auto-update as you make changes.

For further guidance, [visit plasmo Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
yarn build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
