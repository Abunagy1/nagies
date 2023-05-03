const Post = require('../models/post');
const Author = require('../models/author');
const Genre = require('../models/genre');
const PostInstance = require('../models/postinstance');
const async = require('async');
exports.index = function(req, res) {
    async.parallel({
            post_count: function(callback) {
                Post.countDocuments({}, callback);
            },
            post_instance_count: function(callback) {
                PostInstance.countDocuments({}, callback);
            },
            post_instance_available_count: function(callback) {
                PostInstance.countDocuments({ status: 'Available' }, callback);
            },
            author_count: function(callback) {
                Author.countDocuments({}, callback);
            },
            genre_count: function(callback) {
                Genre.countDocuments({}, callback);
            },
        },
        function(err, results) {
            res.render('index', {
                title: 'Local Library Home',
                error: err,
                data: results,
            });
        }
    );
};