# puppeteer-traverse

`puppeteer-traverse` is a Puppeteer utility to easily run a function you define per route on a set of routes.

Your function will have access to an instance of [Puppeteer Page](https://pptr.dev/#?product=Puppeteer&show=api-class-page) for every route you have in your configuration, making it simple to run things like visual regression tests, accessibility checks, and other types of validations you might want to run on an entire website.

[![codecov](https://codecov.io/gh/beckkramer/puppeteer-traverse/branch/main/graph/badge.svg?token=K32F7O3GV5)](https://codecov.io/gh/beckkramer/puppeteer-traverse)

## Screenshots

### Mid-run of example:
![Screenshot 2022-04-30 123108](https://user-images.githubusercontent.com/2972688/166116163-b7abe728-9602-42aa-87b5-378a846f971d.png)

### Completed run, with example of error on one route:
![Screenshot 2022-04-30 123139](https://user-images.githubusercontent.com/2972688/166116174-cd389292-b14d-4bbb-b704-72ca2fbea805.png)

## Setup:

### Add to your project

```
npm install puppeteer-traverse
```

### Populate configuration

To run puppeteer-traverse as part of your project, you'll need to add configuration for the site you want to check, and a function to be run on every route. This is the minimal setup, and might be all you need!

```js
export const config = {
  app: {
    errorContent: [],
    rootUrl: 'https://site-to-check.com',
  },
  features: [
    {
      name: 'Food Menu',
      id: 'menu_food',
      paths: [
        '/menu/breakfast',
        '/menu/dinner',
        '/menu/lunch',
      ]
    },
    {
      name: 'Drinks Menu',
      id: 'menu_drinks',
      paths: [
        '/menu/beer',
        '/menu/drinks',
        '/menu/wine',
      ]
    }
  ]
};
```

### Additional Options:

You might want to skip a route from being checked in certain cases (e.g. if your site has a 404 page and you want to skip it if a route redirects there). If the site you are checking has standardized 404/error content, you can include an array of strings as `errorContent` in your config. If found on a page, the route will be skipped. If you don't want to skip any routes, just leave the `errorContent` array empty.

## Example: Take a screenshot per route

This example presumes you have Yarn installed, as the project uses it locally.

Inside the `/examples` folder of this project, you'll find configuration, overrides, and a function that will take a screenshot per route. You can take the example for a spin by cloning the repo, running `yarn` to install dependencies, and then and running `yarn example`.
