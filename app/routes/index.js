module.exports = (app, router) => {
    const controllers = require('../controllers');
    router.get('/searchTracks/:name', controllers.searchTracks);
    router.post('/saveFavorite', controllers.saveFavorite);
    app.use('/', router);
}
