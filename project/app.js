const createError = require('http-errors');
const express = require('express');
const app = express();
//const router = express.Router()

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const stylus = require('stylus');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');

const mongoDB = process.env.DB_URI;
mongoose.connect(mongoDB, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => console.log("connected to db"));
mongoose.Promise = global.Promise;
// Get the default connection1
const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const routes = require('./routes/index');
app.use('/', routes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());
app.use(compression());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
/*
const dbo = require('./db/conn');
// error handler
dbo.connectToServer(function(err) {
    if (err) {
        console.error(err);
        process.exit();
    }
    app.use(function(err, req, res) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
});
*/
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;