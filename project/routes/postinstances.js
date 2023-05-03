const express = require('express');
const routes = express.Router();
const post_instance_controller = require('../controllers/postinstanceController');
//const { validateRequest, loginValidation } = require("../utilities/validation");
/// POSTINSTANCE ROUTES ///
// GET request for creating a PostInstance. NOTE This must come before route that displays PostInstance (uses id).
routes.get('/create', post_instance_controller.postinstance_create_get);
// POST request for creating PostInstance.
routes.post('/create', post_instance_controller.postinstance_create_post);
// GET request to delete PostInstance.
routes.get('/:id/delete', post_instance_controller.postinstance_delete_get);
// POST request to delete PostInstance.
routes.post('/:id/delete', post_instance_controller.postinstance_delete_post);
// GET request to update PostInstance.
routes.get('/:id/update', post_instance_controller.postinstance_update_get);
// POST request to update PostInstance.
routes.post('/:id/update', post_instance_controller.postinstance_update_post);
// GET request for one PostInstance.
routes.get('/:id', post_instance_controller.postinstance_detail);
// GET request for list of all PostInstance.
routes.get('/', post_instance_controller.postinstance_list);
module.exports = routes;