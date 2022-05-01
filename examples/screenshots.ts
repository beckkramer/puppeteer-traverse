import traverse, {RouteFunctionT} from '..';
import { config } from './exampleConfig';

// If you're on Windows, you might need to point Puppeteer at Chrome:
// const PUPPETEER_BROWSER_WINDOWS = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

// You can override any browser options Puppeteer references here.
const browserOptions = {
  // executablePath: PUPPETEER_BROWSER_WINDOWS,
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