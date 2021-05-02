
'use strict';

import fs from 'fs';
import puppeteer,{ Browser, LaunchOptions, Page } from 'puppeteer-core'

import {
  ConfigT,
  FeatureT,
  PageLoadOverridesT,
  RouteFunctionT,
} from '../types'

export const getConfig = async (filePath: string): Promise<ConfigT> => {

  let configData

  try {
    configData = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.log('Issue loading config.');
    process.exit();
  }

  return JSON.parse(configData)[0]
};

export const setUpPuppeteerBrowser = async (browserOptions = {}): Promise<Browser> => {
  let browser;

  try {
    browser = await puppeteer.launch({
      ...browserOptions,
    })
  } catch(error) {
    console.log(error);
  }

  if (!browser) {
    return Promise.reject('There was an issue launching the Puppeteer browser.');
  } else {
    return Promise.resolve(browser);
  }
};

export const getDestinationPage = async (options: {
  loadOptions?: PageLoadOverridesT,
  page: Page,
  path: string,
  rootUrl: string,
}): Promise<Page> => {

  const { path, loadOptions, page, rootUrl } = options;

  let fullUrl = `${rootUrl}/${path}/`;

  // Skips the // after http:// or https://, and checks the path for 
  // any // in the event a path had an unexpected leading or trailing /
  fullUrl = fullUrl.replace(/(?<!:)(\/{2})/g, '/');

  console.log(`Navigating to ${fullUrl}...`)

  await page
    .goto(fullUrl, {
      waitUntil: 'networkidle2',
      ...loadOptions,
    })
    .catch(() => {
      return Promise.reject(`Unable to go to ${fullUrl}.`);
    });

  if (page.url().toLowerCase() !== fullUrl.toLowerCase()) {
    return Promise.reject(`Unable to go to ${fullUrl}. Current URL is ${page.url()}.`)
  }

  return Promise.resolve(page);
}

const runOnFeature = async (options: {
  feature: FeatureT,
  browser: Browser,
  pageLoadOptions: PageLoadOverridesT,
  perRouteFunction: RouteFunctionT,
  rootUrl: string,
}) => {

  const {
    feature,
    browser,
    pageLoadOptions,
    perRouteFunction,
    rootUrl,
  } = options;

  console.group(`Attempting to run on ${feature.name} paths...\n`)

    for await (const path of feature.paths) {

      const page = await browser.newPage();
      let destinationPage: Page;

      try {
        destinationPage = await getDestinationPage({
          loadOptions: pageLoadOptions,
          page,
          path,
          rootUrl,
        });

        console.log('Running passed in function(s)...');

        try {
          const { id, name } = feature
          await perRouteFunction({
            currentRoute: path,
            feature: {
              id,
              name,
            },
            puppeteerPage: destinationPage,
          });
          console.log('Finished!\n')
        } catch (error) {
          console.log(error);
        }

        await destinationPage.close();

      } catch (error) {
        console.log(`Page for ${path} could not be loaded, skipping.`)
        page.close();
        return Promise.reject(`Page for ${path} could not be loaded, skipping.`);
      }
    }
    console.groupEnd();
}

export const run = async (options: {
  browserOptions?: Partial<LaunchOptions>,
  configFile: string,
  pageLoadOptions?: PageLoadOverridesT,
  perRouteFunction: RouteFunctionT,
}): Promise<void> => {

  const {
    browserOptions = {},
    configFile,
    pageLoadOptions,
    perRouteFunction,
  } = options

  if (!configFile) {
    return Promise.reject('Cannot run, configFile is not defined.');
  }
  if (!perRouteFunction) {
    return Promise.reject('Cannot run, perRouteFunction is not defined.');
  }

  const { app, features } = await getConfig(configFile);

   const browser = await setUpPuppeteerBrowser(browserOptions);

  for await (const feature of features) {

    await runOnFeature({
      browser,
      feature,
      pageLoadOptions,
      perRouteFunction,
      rootUrl: app.rootUrl,
    });
  }

  await browser.close();

  return Promise.resolve();
}
