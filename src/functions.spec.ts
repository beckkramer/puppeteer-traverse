
import puppeteer from 'puppeteer';
import testConfig from './__test__/testConfig';


import {
  run,
} from './functions';

import {
  stubBrowser,
  stubPage,
} from './__test__/mockPuppeteer';

const testFunction = jest.fn(async () => {
  await setTimeout(jest.fn(), 200);
});

jest.mock('cli-progress', () => ({
  MultiBar() {
    return {
      create() {
        return {
          increment: jest.fn(),
        }
      },
      stop: jest.fn(),
    };
  },
  Presets: {
    shades_grey: '',
  },
}));

jest.mock('puppeteer', () => ({
  launch() {
    return stubBrowser;
  }
}));

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('@run', () => {

  beforeEach(() => {
    // Since run has console logging throughout, we disable it here
    // to reduce noise. Comment out below if you wish to view
    // console log output.
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'group').mockImplementation(jest.fn());
  });

  it('should verify config before running Puppeteer scripts', async () => {

    expect.assertions(2);

    await expect(run({
      config: null,
      perRouteFunction: testFunction,
    })).rejects.toEqual('Cannot run, config is not defined or is incomplete.');

    await expect(run({
      config: testConfig,
      perRouteFunction: null,
    })).rejects.toEqual('Cannot run, perRouteFunction is not defined.');
  });

  it('should call the passed in function once per path', async () => {

    jest.spyOn(stubPage, 'url')
      .mockReturnValue('https://searching-stuff.com/results/');

    expect.assertions(1);

    await run({
      config: testConfig,
      perRouteFunction: testFunction,
    });

    expect(testFunction).toHaveBeenCalledTimes(2);
  });

  it('should close pages and browser when finished', async() => {

    const browserCloseSpy = jest.spyOn(stubBrowser, 'close');
    const pageCloseSpy = jest.spyOn(stubPage, 'close');

    jest.spyOn(stubPage, 'url')
      .mockReturnValue('https://searching-stuff.com/results/');

    expect.assertions(2);

    await run({
      config: testConfig,
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
        config: testConfig,
        perRouteFunction: testFunction,
      })).rejects.toEqual('There was an issue launching the Puppeteer browser.');
    });

    it('should log a message if a URL redirects', async() => {
      jest.spyOn(stubPage, 'url')
        .mockReturnValue('https://searching-stuff.com/nope/');

      await run({
        config: testConfig,
        perRouteFunction: testFunction,
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('All features finished')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Unable to go to https://searching-stuff.com/results/; redirected to https://searching-stuff.com/nope/.')
      );
    });

    it('should not run if error content found', async() => {
      jest.spyOn(stubPage, 'url')
        .mockReturnValue('https://searching-stuff.com/results/');
      jest.spyOn(stubPage, 'content')
        .mockResolvedValue('<html>not found</html>');

      await run({
        config: testConfig,
        perRouteFunction: testFunction,
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Error content found on https://searching-stuff.com/results/; route skipped.')
      );
    });
  });
});
