# Traverse

[![codecov](https://codecov.io/gh/beckkramer/puppeteer-traverse/branch/main/graph/badge.svg?token=K32F7O3GV5)](https://codecov.io/gh/beckkramer/puppeteer-traverse)

Traverse lets you easily run the same function on batches of feature routes. Your function will have access to an instance of [Puppeteer Page](https://pptr.dev/#?product=Puppeteer&show=api-class-page) for every route you have in your configuration, making it simple to run things like visual regression tests, accessibility checks, and other types of validations you might want to run on an entire website.

## Setup:

To run Traverse as part of your project, you'll need to add configuration for the site you want to check, and a function to be run on every route. This is the minimal setup, and might be all you need!

### Additional Options:

You might want to skip a route from being checked in certain cases (e.g. if your site has a 404 page and you want to skip it if a route redirects there). If the site you are checking has standardized 404/error content, you can include an array of strings as `errorContent` in your config. If found on a page, the route will be skipped. If you don't want to skip any routes, just leave the `errorContent` array empty.

## Example: Take a screenshot per route

Inside the `/examples` folder of this project, you'll find configuration, overrides, and a function that will take a screenshot per route. You can take the example for a spin by cloning the repo, running `yarn` to install dependencies, and then and running `yarn example`.