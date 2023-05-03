const express = require('express');
const routes = express.Router();
const post_controller = require('../controllers/postController');
const { validateRequest, loginValidation } = require("../utilities/validation");
/// POST ROUTES ///
// GET request for list of all Post.
routes.get('/', post_controller.post_list);
// GET request for one Post. /catalogue/post/id
routes.get('/:id', post_controller.post_detail);
// GET request for creating a Post. NOTE This must come before routes that display Post (uses id).
routes.get('/create', validateRequest(loginValidation), post_controller.post_create_get);
// POST request for creating Post.
routes.post('/create', post_controller.post_create_post);
// GET request to update Post.
routes.get('/:id/update', post_controller.post_update_get); //
// POST request to update Post.
routes.post('/:id/update', post_controller.post_update_post); //
// GET request to delete Post.
routes.get('/:id/delete', post_controller.post_delete_get);
// POST request to delete Post.
routes.post('/:id/delete', post_controller.post_delete_post);
module.exports = routes;