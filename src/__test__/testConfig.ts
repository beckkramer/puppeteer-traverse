export default {
  app: {
    errorContent: ['not found'],
    rootUrl: 'https://searching-stuff.com'
  },
  features: [
    {
      name: 'Actors',
      id: 'actors',
      paths: [
        'best-actors',
        'worst-actors',
      ]
    },
    {
      name: 'Directors',
      id: 'directors',
      paths: [
        'best-directors'
      ]
    }
  ]
}
