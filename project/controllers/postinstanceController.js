const PostInstance = require('../models/postinstance');
const Post = require('../models/post');
const async = require('async');
const { body, validationResult } = require('express-validator');
// Display list of all PostInstances.
exports.postinstance_list = function(req, res, next) {
    PostInstance.find()
        .populate('post')
        .exec(function(err, list_postinstances) {
            if (err) {
                return next(err);
            }
            // Successful, so render.
            res.render('postinstance_list', {
                title: 'Post Instance List',
                postinstance_list: list_postinstances,
            });
        });
};
// Display detail page for a specific PostInstance.
exports.postinstance_detail = function(req, res, next) {
    PostInstance.findById(req.params.id)
        .populate('post')
        .exec(function(err, postinstance) {
            if (err) {
                return next(err);
            }
            if (postinstance == null) {
                // No results.
                let err = new Error('Post copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('postinstance_detail', {
                title: 'Post:',
                postinstance: postinstance,
            });
        });
};
// Display PostInstance create form on GET.
exports.postinstance_create_get = function(req, res, next) {
    Post.find({}, 'title').exec(function(err, posts) {
        if (err) {
            return next(err);
        }
        // Successful, so render.
        res.render('postinstance_form', {
            title: 'Create PostInstance',
            post_list: posts,
        });
    });
};
// Handle PostInstance create on POST.
exports.postinstance_create_post = [
    // Validate and sanitize fields.
    body('post', 'Post must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a PostInstance object with escaped and trimmed data.
        const postinstance = new PostInstance({
            post: req.body.post,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Post.find({}, 'title').exec(function(err, posts) {
                if (err) {
                    return next(err);
                }
                // Successful, so render.
                res.render('postinstance_form', {
                    title: 'Create PostInstance',
                    post_list: posts,
                    selected_post: postinstance.post._id,
                    errors: errors.array(),
                    postinstance: postinstance,
                });
            });
            return;
        } else {
            // Data from form is valid
            postinstance.save(function(err) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to new record.
                res.redirect(postinstance.url);
            });
        }
    },
];
// Display PostInstance delete form on GET.
exports.postinstance_delete_get = function(req, res, next) {
    PostInstance.findById(req.params.id)
        .populate('post')
        .exec(function(err, postinstance) {
            if (err) {
                return next(err);
            }
            if (postinstance == null) {
                // No results.
                res.redirect('/catalog/postinstances');
            }
            // Successful, so render.
            res.render('postinstance_delete', {
                title: 'Delete PostInstance',
                postinstance: postinstance,
            });
        });
};
// Handle PostInstance delete on POST.
exports.postinstance_delete_post = function(req, res, next) {
    // Assume valid PostInstance id in field.
    PostInstance.findByIdAndRemove(req.body.id, function deletePostInstance(err) {
        if (err) {
            return next(err);
        }
        // Success, so redirect to list of PostInstance items.
        res.redirect('/catalog/postinstances');
    });
};
// Display PostInstance update form on GET.
exports.postinstance_update_get = function(req, res, next) {
    // Get post, authors and genres for form.
    async.parallel({
            postinstance: function(callback) {
                PostInstance.findById(req.params.id).populate('post').exec(callback);
            },
            posts: function(callback) {
                Post.find(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.postinstance == null) {
                // No results.
                let err = new Error('Post copy not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('postinstance_form', {
                title: 'Update  PostInstance',
                post_list: results.posts,
                selected_post: results.postinstance.post._id,
                postinstance: results.postinstance,
            });
        }
    );
};
// Handle PostInstance update on POST.
exports.postinstance_update_post = [
    // Validate and sanitize fields.
    body('post', 'Post must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('status').escape(),
    body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a PostInstance object with escaped/trimmed data and current id.
        const postinstance = new PostInstance({
            post: req.body.post,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });
        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Post.find({}, 'title').exec(function(err, posts) {
                if (err) {
                    return next(err);
                }
                // Successful, so render.
                res.render('postinstance_form', {
                    title: 'Update PostInstance',
                    post_list: posts,
                    selected_post: postinstance.post._id,
                    errors: errors.array(),
                    postinstance: postinstance,
                });
            });
            return;
        } else {
            // Data from form is valid.
            PostInstance.findByIdAndUpdate(
                req.params.id,
                postinstance, {},
                function(err, thepostinstance) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to detail page.
                    res.redirect(thepostinstance.url);
                }
            );
        }
    },
];