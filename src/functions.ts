
'use strict';

import parse from 'csv-parse';
import fs from 'fs';
import puppeteer,{ Browser, LaunchOptions, Page } from 'puppeteer-core'

type FeatureT = {
  [columnName: string]: string,
}

// Checks CSV file and prints out data
export const getAllFeatures = async (filePath: string): Promise<FeatureT[]> => {

  // if no file, throws unhandled
  const featureCsvContent = await fs.readFileSync(filePath, 'utf-8')

  const parsedCsv = await parse(featureCsvContent, {
    columns: true,
  });

  const features = []

  for await (const feature of parsedCsv) {
    features.push(feature);
  }

  return features
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
  feature: FeatureT,
  loadOptions?: puppeteer.WaitForOptions & { referrer: string },
  page: Page,
  rootUrl: string,
}): Promise<Page> => {

  const { feature, loadOptions, page, rootUrl } = options;
  const featureUrl = `${rootUrl}/${feature.url}/`;

  await page
    .goto(featureUrl, {
      waitUntil: 'networkidle2',
      ...loadOptions,
    })
    .catch(() => {
      return Promise.reject(`Unable to go to ${featureUrl}.`);
    });

  if (page.url().toLowerCase() !== featureUrl.toLowerCase()) {
    return Promise.reject(`Unable to go to ${featureUrl}. Current URL is ${page.url()}.`)
  }

  return page
}

export const run = async (options: {
  browserOptions?: LaunchOptions,
  featureConfigCsv: string,
  pageLoadOptions?: puppeteer.WaitForOptions & { referrer: string },
  perRouteFunction: (page: Page) => Promise<void>,
  rootUrl: string,
}): Promise<void> => {

  const {
    browserOptions = {},
    featureConfigCsv,
    pageLoadOptions,
    perRouteFunction,
    rootUrl,
  } = options

  if (!rootUrl) {
    return Promise.reject('Cannot run, rootUrl is not defined.');
  }
  if (!featureConfigCsv) {
    return Promise.reject('Cannot run, featureConfigCsv is not defined.');
  }
  if (!perRouteFunction) {
    return Promise.reject('Cannot run, perRouteFunction is not defined.');
  }

  const allFeatures = await getAllFeatures(featureConfigCsv);
  const browser = await setUpPuppeteerBrowser(browserOptions);

  for await (const feature of allFeatures) {

    const page = await browser.newPage()

    console.group(`Attempting to visit to ${feature.feature}...`)

    const destinationPage: Page = await getDestinationPage({
      page: page,
      feature: feature,
      loadOptions: pageLoadOptions,
      rootUrl: rootUrl,
    });

    if (!destinationPage) {
      console.log(`Page for ${feature.name} could not be loaded, skipping.`)
      return
    }

    console.log('Running passed in function(s)...');

    try {
      const passedInFunctions = async () => {
        await perRouteFunction(destinationPage);
      }

      await passedInFunctions();

      console.log('Finished!\n')
      console.groupEnd();
    } catch (error) {
      console.log(error);
    }

    await destinationPage.close();
  }

  await browser.close();

  return Promise.resolve();
}
