//const express = require('express');
//const router = express.Router();
const routes = require("express").Router();
const user_controller = require('../controllers/userController');
//const { validateRequest, loginValidation } = require("../utilities/validation");
const { createAuthToken, verifyAuthToken } = require('../utilities/authentication');
// GET request for list of all User.
routes.get('/', user_controller.users_list);
// GET request for one User. /users/id
routes.get('/:id', verifyAuthToken, user_controller.user_detail);

routes.get('/{:id}', user_controller.getUserByToken);
// GET request for create new User
routes.get('/create', user_controller.user_create_get);
// POST request for creating User.
routes.post('/create', user_controller.user_create_post);

routes.post('/signup', createAuthToken, user_controller.signup);
// POST requst for Authenticate User
routes.post('/login', verifyAuthToken, user_controller.login);
// GET request to update User.
routes.get('/:id/update', user_controller.user_update_get); //
// POST request to update User.
routes.post('/:id/update', user_controller.user_update_post); //
// GET request to delete User.
routes.get('/:id/delete', user_controller.user_delete_get);
// POST request to delete User.
routes.post('/:id/delete', verifyAuthToken, user_controller.user_delete_post);

/*
router.get('/example', (req, res) => {
    user_controller.fetchUserByToken(req).then((user) => {
        // do somthing with user
    }).catch((err) => {
        console.log(err)
        res.json(err)
    })
})
*/

module.exports = routes;