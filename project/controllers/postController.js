const Post = require('../models/post');
const Author = require('../models/author');
const Genre = require('../models/genre');
const PostInstance = require('../models/postinstance');
const { body, validationResult } = require('express-validator');
const async = require('async');
// Display list of all posts.
exports.post_list = function(req, res, next) {
    Post.find({}, 'title author')
        .sort({ title: 1 })
        .populate('author')
        .exec(function(err, list_posts) {
            if (err) {
                return next(err);
            } else {
                // Successful, so render
                res.render('post_list', { title: 'Post List', post_list: list_posts });
            }
        });
};
// Display detail page for a specific post.
exports.post_detail = function(req, res, next) {
    async.parallel({
            post: function(callback) {
                Post.findById(req.params.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback);
            },
            post_instance: function(callback) {
                PostInstance.find({ post: req.params.id }).exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.post == null) {
                // No results.
                let err = new Error('Post not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('post_detail', { title: results.post.title, post: results.post, post_instances: results.post_instance, });
        }
    );
};
// Display post create form on GET.
exports.post_create_get = function(req, res, next) {
    // Get all authors and genres, which we can use for adding to our post.
    async.parallel({
            authors: function(callback) {
                Author.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            res.render('post_form', {
                title: 'Create Post',
                authors: results.authors,
                genres: results.genres,
            });
        }
    );
};
// Handle post create on POST.
exports.post_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') req.body.genre = [];
            else req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a Post object with escaped and trimmed data.
        var post = new Post({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
        });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            // Get all authors and genres for form.
            async.parallel({
                    authors: function(callback) {
                        Author.find(callback);
                    },
                    genres: function(callback) {
                        Genre.find(callback);
                    },
                },
                function(err, results) {
                    if (err) {
                        return next(err);
                    }

                    // Mark our selected genres as checked.
                    for (let i = 0; i < results.genres.length; i++) {
                        if (post.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }
                    res.render('post_form', {
                        title: 'Create Post',
                        authors: results.authors,
                        genres: results.genres,
                        post: post,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            // Data from form is valid. Save post.
            post.save(function(err) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to new post record.
                res.redirect(post.url);
            });
        }
    },
];
// Display post delete form on GET.
exports.post_delete_get = function(req, res, next) {
    async.parallel({
            post: function(callback) {
                Post.findById(req.params.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback);
            },
            post_postinstances: function(callback) {
                PostInstance.find({ post: req.params.id }).exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.post == null) {
                // No results.
                res.redirect('/posts');
            }
            // Successful, so render.
            res.render('post_delete', {
                title: 'Delete Post',
                post: results.post,
                post_instances: results.post_postinstances,
            });
        }
    );
};
// Handle post delete on POST.
exports.post_delete_post = function(req, res, next) {
    // Assume the post has valid id (ie no validation/sanitization).
    async.parallel({
            post: function(callback) {
                Post.findById(req.body.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback);
            },
            post_postinstances: function(callback) {
                PostInstance.find({ post: req.body.id }).exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            // Success
            if (results.post_postinstances.length > 0) {
                // Post has post_instances. Render in same way as for GET route.
                res.render('post_delete', {
                    title: 'Delete Post',
                    post: results.post,
                    post_instances: results.post_postinstances,
                });
                return;
            } else {
                // Post has no PostInstance objects. Delete object and redirect to the list of posts.
                Post.findByIdAndRemove(req.body.id, function deletePost(err) {
                    if (err) {
                        return next(err);
                    }
                    // Success - got to posts list.
                    res.redirect('/posts');
                });
            }
        }
    );
};
// Display post update form on GET.
exports.post_update_get = function(req, res, next) {
    // Get post, authors and genres for form.
    async.parallel({
            post: function(callback) {
                Post.findById(req.params.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback);
            },
            authors: function(callback) {
                Author.find(callback);
            },
            genres: function(callback) {
                Genre.find(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.post == null) {
                // No results.
                let err = new Error('Post not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (
                var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++
            ) {
                for (
                    var post_g_iter = 0; post_g_iter < results.post.genre.length; post_g_iter++
                ) {
                    if (
                        results.genres[all_g_iter]._id.toString() ===
                        results.post.genre[post_g_iter]._id.toString()
                    ) {
                        results.genres[all_g_iter].checked = 'true';
                    }
                }
            }
            res.render('post_form', {
                title: 'Update Post',
                authors: results.authors,
                genres: results.genres,
                post: results.post,
            });
        }
    );
};
// Handle post update on POST.
exports.post_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') req.body.genre = [];
            else req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    // Validate and santitize fields.
    body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a Post object with escaped/trimmed data and old id.
        var post = new Post({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
            _id: req.params.id, // This is required, or a new ID will be assigned!
        });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            // Get all authors and genres for form
            async.parallel({
                    authors: function(callback) {
                        Author.find(callback);
                    },
                    genres: function(callback) {
                        Genre.find(callback);
                    },
                },
                function(err, results) {
                    if (err) {
                        return next(err);
                    }
                    // Mark our selected genres as checked.
                    for (let i = 0; i < results.genres.length; i++) {
                        if (post.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }
                    res.render('post_form', {
                        title: 'Update Post',
                        authors: results.authors,
                        genres: results.genres,
                        post: post,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            // Data from form is valid. Update the record.
            Post.findByIdAndUpdate(req.params.id, post, {}, function(err, thepost) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to post detail page.
                res.redirect(thepost.url);
            });
        }
    },
];