import { Browser, Page } from 'puppeteer';

// Pulled from https://github.com/aarmora/jordan-tests-puppeteer-scripts/blob/master/test/mockPuppeteer.ts

export const stubPage = {
  close() {
    return Promise.resolve();
  },
  content() {
    return Promise.resolve('some content');
  },
  goto(url: string) {
    return Promise.resolve(url);
  },
  url() {
    return 'www.somewhere.com';
  },
} as unknown as Page;

export const stubBrowser = {
  newPage() {
    return Promise.resolve(stubPage);
  },
  close() {
    return Promise.resolve();
  }
} as unknown as Browser;

export const stubPuppeteer = {
  launch() {
    return Promise.resolve(stubBrowser);
  }
} as unknown as any;
