# Traverse



Traverse lets you easily run the same function on batches of feature routes. Your function will have access to an instance of [Puppeteer Page](https://pptr.dev/#?product=Puppeteer&show=api-class-page) for every route you have in your configuration, making it simple to run things like visual regression tests, accessibility checks, and other types of validations you might want to run on an entire website.

## Setup:

To run Traverse as part of your project, you'll need to add configuration for the site you want to check, and a function to be run on every route. This is the minimal setup, and might be all you need!

### Additional Options:

It's possible there might be an issue with a route you're checking, and you might want to skip a route from being checked in these cases. If the site you are checking has standardized 404/error content, you can include an array of strings as `errorContent` in your config. If found on a page, the route will be skipped.

## Example: Take a screenshot per route

This project has a set of example files in the `/examples` folder. Inside you'll find configuration, overrides, and a function that will take a screenshot per route. You can take the example for a spin by cloning the repo, running `yarn` to install dependencies, and then and running `yarn example`.
