export const config = {
  app: {
    errorContent: ['page not found'],
    rootUrl: 'https://en.wikipedia.org/wiki',
  },
  features: [
    {
      name: 'Sedimentary Rocks',
      id: 'sedimentary',
      paths: ['/Shale', '/Feldspar', '/Coal', '/Gypsum'],
    },
    {
      name: 'Fibers',
      id: 'fibers',
      paths: ['/Wool', '/Cotton', '/Rayon', '/Linen'],
    },
  ],
};
