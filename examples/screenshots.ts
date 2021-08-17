import traverse, { RouteFunctionT } from '../.';
import { config } from './exampleConfig';

// If you're on Windows, you might need to point Puppeteer at Chrome:
const PUPPETEER_BROWSER = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const takeScreenshotPerRoute: RouteFunctionT = async (options) => {

  const { currentRoute, feature, puppeteerPage } = options

  try {
    // Takes a screenshot based on current route name and saves it to /examples folder.
    await puppeteerPage.screenshot({
      path: `./examples/screenshot-${feature.name}-${currentRoute.replace(/\//g, '_')}.png`,
    });
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

const browserOptions = {
  executablePath: PUPPETEER_BROWSER,
  ignoreDefaultArgs: ['--disable-extensions'],
};

(async () => {
  try {
    await traverse.run({
      browserOptions: browserOptions,
      config: config,
      perRouteFunction: takeScreenshotPerRoute,
    });
  } catch (error) {
    console.log(error);
  }
})();