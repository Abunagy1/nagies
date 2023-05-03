const express = require('express');
const routes = express.Router();
const authorsRouter = require('./authors');
const postsRouter = require('./posts');
const instancesRouter = require('./postinstances');
const genresRouter = require('./genres');
const dashboardRoutes = require("./dashboard");
const usersRouter = require('./users');
//const aboutRouter = require('./about');
//const contactRouter = require('./contact');
//const { validateRequest, loginValidation } = require("../utilities/validation");
// validation should on index routes modue only for no dublication on routes that needs validation
const verifyToken = require("../utilities/validate-token");
// next routes could be put here or in server app.js as the rest of routes but due to auth or validation
// just put all in one file
routes.use('/users', verifyToken, usersRouter);
//app.use('/about', aboutRouter);
//app.use('/contact', contactRouter);
routes.use("/dashboard", verifyToken, dashboardRoutes);
routes.use('/authors', authorsRouter);
routes.use('/posts', postsRouter);
routes.use('/postinstances', instancesRouter);
routes.use('/genres', genresRouter);

/* GET home page. */
const home = require('../controllers/homeController');
routes.get('/', home.index);

module.exports = routes;