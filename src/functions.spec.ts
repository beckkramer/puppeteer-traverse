
import puppeteer,{ Browser, LaunchOptions, Page } from 'puppeteer-core'

import { 
  getConfig,
  getDestinationPage,
  run,
  setUpPuppeteerBrowser,
} from './functions';

import {
  stubBrowser,
  stubPage,
  stubPuppeteer,
} from './__test__/mockPuppeteer';

const testConfig = __dirname + '/__test__/testConfig.json';

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

    expect.assertions(2);

    await expect(run({
      configFile: null,
      perRouteFunction: testFunction,
    })).rejects.toEqual('Cannot run, configFile is not defined.');

    await expect(run({
      configFile: testConfig,
      perRouteFunction: null,
    })).rejects.toEqual('Cannot run, perRouteFunction is not defined.');
  });

  it('should call the passed in function once per path', async () => {

    jest.spyOn(stubPage, 'url')
      .mockReturnValue('https://searching-stuff.com/results/');

    expect.assertions(1);

    await run({
      configFile: testConfig,
      perRouteFunction: testFunction,
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
      configFile: testConfig,
      perRouteFunction: testFunction,
    });

    expect(pageCloseSpy).toHaveBeenCalledTimes(2);
    expect(browserCloseSpy).toHaveBeenCalledTimes(1);
  });

  describe('when there is an issue loading', () => {
    it('should pass along a message about the browser', async () => {
      jest.spyOn(puppeteer, 'launch')
        .mockRejectedValue('');
  
      await expect(run({
        configFile: testConfig,
        perRouteFunction: testFunction,
      })).rejects.toEqual('There was an issue launching the Puppeteer browser.');
    });

    it('should log a message if the loaded URL does not match the feature URL', async() => {
      jest.spyOn(stubPage, 'url')
        .mockReturnValue('https://searching-stuff.com/redirected/');

      expect.assertions(1);

      await expect(run({
        configFile: testConfig,
        perRouteFunction: testFunction,
      })).rejects.toEqual('Page for results could not be loaded, skipping.');
    });
  });
});
