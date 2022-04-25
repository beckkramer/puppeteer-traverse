import puppeteer, { Page } from 'puppeteer';

export type ConfigT = {
  app: {
    errorContent?: string[]
    rootUrl: string
  },
  features: Array<FeatureT>
};

export type FeatureT = {
  name: string,
  id: string,
  paths: string[],
};

export type PageLoadOverridesT = Partial<puppeteer.WaitForOptions & { referrer: string }>;

export type RouteFunctionT = (options: 
  {
    currentRoute: string,
    feature: Pick<FeatureT, 'name'|'id'>,
    puppeteerPage: Page,
  }
) => Promise<void>;
