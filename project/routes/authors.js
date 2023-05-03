const express = require('express');
const routes = express.Router();
const author_controller = require('../controllers/authorController');
//const { validateRequest, loginValidation } = require("../utilities/validation");
/// AUTHOR ROUTES ///
// GET request for list of all Authors.
routes.get('/', author_controller.author_list); //
// GET request for one Author. /catalogue/author/id
routes.get('/:id', author_controller.author_detail); //
// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
routes.get('/create', author_controller.author_create_get);
// POST request for creating Author.
routes.post('/create', author_controller.author_create_post);
// GET request to delete Author.
routes.get('/:id/delete', author_controller.author_delete_get);
// POST request to delete Author
routes.post('/:id/delete', author_controller.author_delete_post);
// GET request to update Author.
routes.get('/:id/update', author_controller.author_update_get);
// POST request to update Author.
routes.post('/:id/update', author_controller.author_update_post);
module.exports = routes;