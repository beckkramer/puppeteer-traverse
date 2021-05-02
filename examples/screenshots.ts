import traverse, { RouteFunctionT } from '../.';

// If you're on Windows, you might need to point Puppeteer at Chrome:
const PUPPETEER_BROWSER = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

// This path needs to be relative to the folder you run traverse from:
const FEATURE_CONFIG_FILE = 'examples/exampleConfig.json';

const TEST_PUPPETEER_FUNCTION: RouteFunctionT = async (options) => {

  const { currentRoute, feature, puppeteerPage } = options

  try {
    // Takes a screenshot based on current route name and saves it to root.
    await puppeteerPage.screenshot({
      path: `./screenshot-${feature.name}-${currentRoute.replace(/\//g, '_')}.png`,
    });
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

const BROWSER_OVERRIDES = {
  executablePath: PUPPETEER_BROWSER,
  ignoreDefaultArgs: ['--disable-extensions'],
};

(async () => {
  try {
    await traverse.run({
      browserOptions: BROWSER_OVERRIDES,
      configFile: FEATURE_CONFIG_FILE,
      perRouteFunction: TEST_PUPPETEER_FUNCTION,
    });
  } catch (error) {
    console.log(error);
  }
})();