import { run } from './src/functions';

import { Page } from 'puppeteer-core'


const ROOT_URL = 'https://www.reddit.com';
const PUPPETEER_BROWSER = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const FEATURE_CONFIG_FILE = 'src/__test__/test.csv';
const TEST_PUPPETEER_FUNCTION = async (page: Page) => {
  console.log('I am the passed in function.')
  console.log(page.url());
  await page.screenshot({
    path: './screenshot.png',
  });
};
const BROWSER_OVERRIDES = {
  // @ts-ignore
  defaultViewport: null,
  executablePath: PUPPETEER_BROWSER,
  ignoreDefaultArgs: ['--disable-extensions'],
};

(async () => {
  await run({
    browserOptions: BROWSER_OVERRIDES,
    featureConfigCsv: FEATURE_CONFIG_FILE,
    perRouteFunction: TEST_PUPPETEER_FUNCTION,
    rootUrl: ROOT_URL,
  });
})();