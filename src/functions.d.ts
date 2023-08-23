
import { Page } from 'puppeteer';

export declare type ConfigT = {
    app: {
        errorContent?: string[];
        rootUrl: string;
    };
    features: Array<FeatureT>;
};
export declare type FeatureT = {
    name: string;
    id: string;
    paths: string[];
};
export declare type RouteFunctionT = (options: {
    currentRoute: string;
    feature: Pick<FeatureT, 'name' | 'id'>;
    puppeteerPage: Page;
}) => Promise<void>;