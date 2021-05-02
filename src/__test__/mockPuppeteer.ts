import { Browser, Page } from 'puppeteer-core';

// Pulled from https://github.com/aarmora/jordan-tests-puppeteer-scripts/blob/master/test/mockPuppeteer.ts

export const stubPage = {
  close() {
    return Promise.resolve();
  },
  goto(url: string) {
    return Promise.resolve();
  },
  url() {
    return '';
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

// export const stubElementHandle = {
//   $eval() {
//     console.log('stub element handle');
//     return Promise.resolve();
//   }
// } as unknown as ElementHandle;