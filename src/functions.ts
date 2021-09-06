
'use strict';

import fs from 'fs';
import puppeteer,{ Browser, LaunchOptions, Page } from 'puppeteer-core';

import { minimal_args } from './constants';

// @ts-ignore: FIXME: Sort out cli progress typing
import { default as cliProgress } from 'cli-progress';

import {
  ConfigT,
  FeatureT,
  PageLoadOverridesT,
  RouteFunctionT,
} from '../types';

export const setUpPuppeteerBrowser = async (browserOptions = {}): Promise<Browser> => {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: minimal_args,
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
  errorContent?: string[],
  loadOptions?: PageLoadOverridesT,
  page: Page,
  path: string,
  rootUrl: string,
}): Promise<Page> => {

  const { errorContent, loadOptions, path, page, rootUrl } = options;

  let fullUrl = `${rootUrl}/${path}/`;

  // Skips the // after http:// or https://, and checks the path for 
  // any // in the event a path had an unexpected leading or trailing /
  fullUrl = fullUrl.replace(/(?<!:)(\/{2})/g, '/');

  await page
    .goto(fullUrl, {
      waitUntil: 'networkidle2',
      ...loadOptions,
    })
    .catch(() => {
      return Promise.reject(`Unable to go to ${fullUrl}; there might be a network issue.`);
    });

  const currentUrl = page.url();

  if (currentUrl?.toLowerCase() !== fullUrl.toLowerCase()) {
    return Promise.reject(`Unable to go to ${fullUrl}; redirected to ${currentUrl}.`);
  }

  if (errorContent) {
    const pageContent = await page.content();
    const foundErrorContent = errorContent.filter(content => {
      return pageContent.toLowerCase().includes(content.toLowerCase());
    });

    if (foundErrorContent.length) {
      return Promise.reject(`Error content found on ${fullUrl}; route skipped.`)
    }
  }

  return Promise.resolve(page);
}

const getProgressBar = (features: FeatureT[]) => {
  let longestFeatureName = '';

  features.forEach(feature => {
    if (feature.name.length > longestFeatureName.length) {
      longestFeatureName = feature.name;
    }
  });

  const barFormat = (options: any, params: any, payload: any) => {

    const completeSize = Math.round(params.progress*options.barsize);
    const incompleteSize = options.barsize-completeSize;
  
    const bar = options.barCompleteString.substr(0, completeSize) +
                options.barGlue +
                options.barIncompleteString.substr(0, incompleteSize);
  
    const featureNameFiller = longestFeatureName.length;
  
    let label = payload.task;
  
    if (payload.task.length < featureNameFiller) {
      const difference = featureNameFiller - payload.task.length;
      const spacer = ' ';
      label += spacer.repeat(difference);
    } 
  
    return `${label} ${bar} ${Math.round(params.value/params.total*100)}% | ${params.value}/${params.total} routes`;
  }

  return new cliProgress.MultiBar({
    clearOnComplete: false,
    format: barFormat,
    hideCursor: true,
  }, cliProgress.Presets.shades_grey);
}

const runOnFeature = async (options: {
  browser: Browser,
  errorContent: string[],
  feature: FeatureT,
  pageLoadOptions: PageLoadOverridesT,
  perRouteFunction: RouteFunctionT,
  progressBar: any,
  rootUrl: string,
}) => {

  const {
    browser,
    errorContent,
    feature,
    pageLoadOptions,
    perRouteFunction,
    progressBar,
    rootUrl,
  } = options;

  const featureProgressBar = progressBar.create(feature.paths.length, 0, {task: feature.name});
  const errors = []

  for await (const path of feature.paths) {

    const page = await browser.newPage();
    let destinationPage: Page;

    try {
      destinationPage = await getDestinationPage({
        errorContent,
        loadOptions: pageLoadOptions,
        page,
        path,
        rootUrl,
      });

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
      } catch (error) {
        Promise.reject(`Error running passed in function on ${path}.`);
      }

      await destinationPage.close();

    } catch (error) {
      page.close();
      errors.push(error)
    } finally {
      featureProgressBar.increment(1);
    }
  }

  if (errors) {
    return Promise.reject(errors);
  }
  return Promise.resolve();
}

export const run = async (options: {
  browserOptions?: Partial<LaunchOptions>,
  config: ConfigT,
  pageLoadOptions?: PageLoadOverridesT,
  perRouteFunction: RouteFunctionT,
}): Promise<void> => {

  const {
    browserOptions = {},
    config,
    pageLoadOptions,
    perRouteFunction,
  } = options

  if (!config || !config.app || !config.features) {
    return Promise.reject('Cannot run, config is not defined or is incomplete.');
  }
  if (!perRouteFunction) {
    return Promise.reject('Cannot run, perRouteFunction is not defined.');
  }

  const start = Date.now();

  const { app, features } = config;

  const browser = await setUpPuppeteerBrowser(browserOptions);

  console.log('\nStarting to run on features...\n');

  const progressBar = getProgressBar(features);

  const allFeaturePromises = features.map(async (feature) => {
    return await runOnFeature({
      browser,
      errorContent: app.errorContent,
      feature,
      pageLoadOptions,
      perRouteFunction,
      progressBar,
      rootUrl: app.rootUrl,
    });
  });

  await Promise.allSettled(allFeaturePromises).then(async (data) => {

    await browser.close();
    progressBar.stop();

    const duration = (Number(Date.now()) - Number(start))/1000;

    console.log(`\n\nAll features finished. Run took ${duration} seconds.\n`);

    const errors = data.reduce(function (errorArray, entry) {
      if (entry.status === 'rejected') {
        if (typeof entry.reason === 'object') {
          entry.reason.forEach((reason: string) => {
            errorArray.push(reason);
          })
        } else {
          errorArray.push(entry.reason);
        }
      }
      return errorArray;
    }, []);

    if (errors.length > 0) {
      console.group('Some issues occured:\n');
      errors.forEach(entry => {
        console.log(`- ${entry}`);
      })
      console.log('\n');
      console.groupEnd();
    }
    return Promise.resolve();
  });
}
