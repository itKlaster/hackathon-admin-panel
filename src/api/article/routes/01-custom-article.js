module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/articles/createBetterArticle',
        handler: 'article.createBetterArticle',
      },
      {
        method: 'GET',
        path: '/articles/:id/html',
        handler: 'article.createHTMLResponse',
      },
      {
        method: 'GET',
        path: '/articles/:id/html-css',
        handler: 'article.createHTMLResponseWithCSS',
      }
    ]
  }