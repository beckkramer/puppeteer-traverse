
import puppeteer,{ Browser, LaunchOptions, Page } from 'puppeteer-core'

import { 
  getAllFeatures,
  getDestinationPage,
  run,
  setUpPuppeteerBrowser,
} from './functions';

import {
  stubBrowser,
  stubPage,
  stubPuppeteer,
} from './__test__/mockPuppeteer';

const testCsvPath = __dirname + '/__test__/test.csv';

const testFunction = jest.fn(async () => {
  await setTimeout(jest.fn(), 200);
});

jest.mock('puppeteer-core', () => ({
	launch() {
		return stubBrowser;
	}
}));

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('@run', () => {
  it('should verify config is complete before running Puppeteer scripts', async () => {

    expect.assertions(3);

    await expect(run({
      featureConfigCsv: null,
      perRouteFunction: testFunction,
      rootUrl: 'https://searching-stuff.com',
    })).rejects.toEqual('Cannot run, featureConfigCsv is not defined.');

    await expect(run({
      featureConfigCsv: testCsvPath,
      perRouteFunction: null,
      rootUrl: 'https://searching-stuff.com',
    })).rejects.toEqual('Cannot run, perRouteFunction is not defined.');

    await expect(run({
      featureConfigCsv: testCsvPath,
      perRouteFunction: testFunction,
      rootUrl: null,
    })).rejects.toEqual('Cannot run, rootUrl is not defined.');
  });

  it('should call the passed in function once per row of feature data', async () => {

    jest.spyOn(stubPage, 'url')
      .mockReturnValue('https://searching-stuff.com/results/');

    expect.assertions(1);

    await run({
      featureConfigCsv: testCsvPath,
      perRouteFunction: testFunction,
      rootUrl: 'https://searching-stuff.com',
    })

    expect(testFunction).toHaveBeenCalledTimes(2);
  });

  it('should close pages and browser when finished', async() => {

    const browserCloseSpy = jest.spyOn(stubBrowser, 'close');
    const pageCloseSpy = jest.spyOn(stubPage, 'close');

    jest.spyOn(stubPage, 'url')
      .mockReturnValue('https://searching-stuff.com/results/');

    expect.assertions(2);

    await run({
      featureConfigCsv: testCsvPath,
      perRouteFunction: testFunction,
      rootUrl: 'https://searching-stuff.com',
    });

    expect(pageCloseSpy).toHaveBeenCalledTimes(2);
    expect(browserCloseSpy).toHaveBeenCalledTimes(1);
  });

  describe('when there is an issue loading', () => {
    it('should pass along a message about the browser', async () => {
      jest.spyOn(puppeteer, 'launch')
        .mockRejectedValue('');
  
      await expect(run({
        featureConfigCsv: testCsvPath,
        perRouteFunction: testFunction,
        rootUrl: 'https://searching-stuff.com',
      })).rejects.toEqual('There was an issue launching the Puppeteer browser.');
    });

    it('should pass along a message about a feature URL', async () => {
      jest.spyOn(stubPage, 'goto')
        .mockRejectedValue('');
  
      await expect(run({
        featureConfigCsv: testCsvPath,
        perRouteFunction: testFunction,
        rootUrl: 'https://searching-stuff.com',
      })).rejects.toEqual('Unable to go to https://searching-stuff.com/results/.');
    });

    it('should log a message if the loaded URL does not match the feature URL', async() => {
      jest.spyOn(stubPage, 'url')
        .mockReturnValue('https://searching-stuff.com/redirected/');

      expect.assertions(1);

      await expect(run({
        featureConfigCsv: testCsvPath,
        perRouteFunction: testFunction,
        rootUrl: 'https://searching-stuff.com',
      })).rejects.toEqual('Unable to go to https://searching-stuff.com/results/. Current URL is https://searching-stuff.com/redirected/.');
    });
  });
});
