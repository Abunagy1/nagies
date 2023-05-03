const express = require('express');
const routes = express.Router();
const genre_controller = require('../controllers/genreController');
//const { validateRequest, loginValidation } = require("../utilities/validation");
/// GENRE ROUTES ///
// GET request for list of all Genre.
routes.get('/', genre_controller.genre_list);
// GET request for one Genre.
routes.get('/:id', genre_controller.genre_detail);
// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
routes.get('/create', genre_controller.genre_create_get);
// POST request for creating Genre.
routes.post('/create', genre_controller.genre_create_post);
// GET request to delete Genre.
routes.get('/:id/delete', genre_controller.genre_delete_get);
// POST request to delete Genre.
routes.post('/:id/delete', genre_controller.genre_delete_post);
// GET request to update Genre.
routes.get('/:id/update', genre_controller.genre_update_get);
// POST request to update Genre.
routes.post('/:id/update', genre_controller.genre_update_post);
module.exports = routes;