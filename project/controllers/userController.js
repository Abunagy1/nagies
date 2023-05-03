const User = require('../models/user');
const async = require('async');
const Post = require('../models/post');
//const PostInstance = require('../models/postinstance');
//const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const { check, oneOf } = require('express-validator')
const validator = require('validator');
//const client = require('../database');
//const bcrypt = require('bcrypt');
// import { client } from 'pg'
//import dotenv from 'dotenv'
//import { Order } from "./order";
//dotenv.config()
//const { BCRYPT_PASSWORD, SALT_ROUNDS } = process.env;
const pepper = process.env.BCRYPT_PASSWORD;
const salt = process.env.SALT_ROUNDS;
const secret = process.env.TOKEN_SECRET;
//const salt = await bcrypt.genSalt(10);  
//const hashPassword = await bcrypt.hash(req.body.password, salt);
const jwt = require("jsonwebtoken");
// import { User } from '../interfaces/user.interface'
//const User = require("../models/User");
const bcrypt = require("bcryptjs");
//const Joi = require("@hapi/joi");
// validation
const { registerValidation, loginValidation } = require("../utilities/validation");
exports.users_list = (_req, res, next) => {
    // like await connection in sql & select from from table and get results.rows
    User.find({}, 'username post').sort({ username: 1 }).populate('post').exec((err, list_users) => {
        if (err) {
            return next(err);
        } else {
            // Successful, so render
            res.render('users_list', { title: 'Users List', users_list: list_users, });
        }
    });
};
// Display detail page for a specific User fetchUserByID.
exports.user_detail = (req, res, next) => {
    async.parallel({
            user: (callback) => {
                // like await connection in sql & select by id from table and get results.rows
                User.findById(req.params.id).exec(callback); // User id is in request address not in body
            },
            user_posts: (callback) => {
                Post.find({ user: req.params.id }, 'title summary').exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            } // Error in API usage.
            if (results.user == null) {
                // No results.
                let err = new Error('User not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('user_detail', { title: 'User Details', user: results.user, user_posts: results.user_posts, });
        }
    );
};
// next function has two option if the user is valid and if not
exports.getUserByToken = async(req, res, next) => {
    // Verifying the existence of valid token
    // before writing it as middleware function
    // try{
    //     // var token = req.headers.authorization as string
    //     // // jwt.verify(req.body.token, secret)
    //     // jwt.verify(token, secret)
    // }
    // catch (err) {
    //     res.status(401)
    //     res.json(`Invalid token ${err}`)
    //     return
    // }
    const user_id = parseInt(req.params.id);
    try { // using verify method to check if the user token is valid
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secret);
        if (decoded.user.id !== user_id) {
            res.json('User ID mismatch with token');
            return;
        } else {
            const user = await User.findOne({ _id: user_id });
            // const updatedUser = await store.update(user, req.body);
            res.json(user);
            return;
        }
    } catch (err) {
        res.json(err);
        next(err)
    }
    const users = await User.users_list();
    res.json(users);
};
// next API function will return a user after get it's token from the request header
exports.fetchUserByToken = (req, res) => {
    return new Promise((resolve, reject) => {
        if (req.headers && req.headers.authorization) {
            let authorization = req.headers.authorization
            let decoded
            try {
                decoded = jwt.verify(authorization, secret)
            } catch (e) {
                reject("Token not Valid")
                return
            }
            let userId = decoded.id
            User.findOne({ _id: userId }).then((user) => {
                resolve(user)
            }).catch((err) => {
                console.log(err)
                reject("Token error")
            })
        } else {
            reject(" No Token found")
            res.status(404).send('You are not authorized to log in please sign up first')
        }
    })
};
exports.user_create_get = (req, res) => {
    res.render('user_form', { title: 'Create User' });
};

exports.create_new_user = async(req, res, next) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty() && errors.errors[0].param === 'email') {
            return res.status(400).send('Invalid email address. Please try again.')
        }
        if (!errors.isEmpty() && errors.errors[0].param === 'password') {
            return res.status(400).send('Password must be longer than 6 characters.')
        }
        const user = await User.create(req.body)
        req.login(user, err => (err ? next(err) : res.json(user)))
    } catch (err) {
        next(err)
    }
};

exports.user_create_post = [ // if you use this function, comment out hush method in user model schema or remove hashSync method from password here
    // Validate and sanitize form fields.
    body('username').trim().isLength({ min: 1 }).escape().withMessage('username must be specified.').isAlphanumeric().withMessage('username has non-alphanumeric characters.'),
    body('email').isEmail(),
    oneOf([
        check('email').isEmail(),
        check('email').not().isEmpty().isString().custom((value, { req }) => {
            if (!validator.isEmail(value)) {
                req.body.flag = true
                    // you can handler your req.body here .... 
            }
            return true
        })
    ]),
    body('birth_date', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('password').trim().isLength({ min: 6 }).escape().withMessage('password must be specified.').isAlphanumeric().withMessage('password has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create User object with escaped and trimmed data
        const user = new User({ username: req.body.username, email: req.body.email, birth_date: req.body.birth_date, password: bcrypt.hashSync(req.body.password + pepper, parseInt(salt)), });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user_form', { title: 'Create New User', user: user, errors: errors.array(), });
            return;
        } else {
            // Data from form is valid.
            // Create a token using sign jwt method & Save user.
            const token = jwt.sign({ id: user._id, email: user.email }, secret)
            user.save(function(err) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to new user record.
                res.json({ success: true, token: token })
                res.redirect(user.url);
            });
        }
    },
];

// register route 
exports.signup = async(req, res) => { // if you use this function, comment out hush method in user model schema
    // validate the user
    const { error } = registerValidation(req.body);
    // throw validation errors
    if (error) return res.status(400).json({ error: error.details[0].message });
    const isEmailExist = await User.findOne({ email: req.body.email });
    // throw error when email already registered
    if (isEmailExist)
        return res.status(400).json({ error: "Email already exists" });
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password + pepper, salt);
    const user = new User({ username: req.body.username, email: req.body.email, birth_date: req.body.birth_date, password, });
    try {
        const token = jwt.sign({ id: user._id, email: user.email }, secret)
        const savedUser = await user.save();
        res.json({ success: true, token: token, error: null, data: { userId: savedUser._id } });
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.create_user = (req, res) => { // if you use this function, comment out hush method in user model schema
    if (!req.body.username || !req.body.email || !req.body.password) { // if you forgot to put required in schema
        res.json({ success: false, error: "Send needed params" })
        return
    }
    User.create({
        username: req.body.username,
        email: req.body.email,
        birth_date: req.body.birth_date,
        password: bcrypt.hashSync(req.body.password + pepper, parseInt(salt))
    }).then((user) => {
        const token = jwt.sign({ id: user._id, email: user.email }, secret)
        res.json({ success: true, token: token })
    }).catch((err) => {
        res.json({ success: true, error: err })
    })
};
// login route
exports.login = async(req, res) => {
    // validate the user
    const { error } = loginValidation(req.body);
    // throw validation errors
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await User.findOne({ email: req.body.email });
    // throw error when email is wrong
    if (!user) return res.status(400).json({ error: "Email is wrong" });
    // check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
        return res.status(400).json({ error: "Password is wrong" });
    // create token
    const token = jwt.sign(
        // payload data
        {
            username: user.username,
            id: user._id,
        },
        process.env.TOKEN_SECRET
    );
    res.header("auth-token", token).json({
        error: null,
        data: {
            token,
        },
    });
};
exports.user_login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.json({ success: false, error: "login params are needed" })
        return
    }
    User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
            res.json({ success: false, error: "User doesn't exist" })
        } else {
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                res.json({ success: false, error: "Wrong password" })
            } else {
                const token = jwt.sign({ id: user._id, email: user.email }, secret)
                res.json({ success: true, token: token, })
            }
        }
    }).catch((err) => {
        res.json({ success: false, eror: err });
    })
};


// Display User delete form on GET.
exports.user_delete_get = function(req, res, next) {
    async.parallel({
            user: function(callback) {
                User.findById(req.params.id).exec(callback); // User id is in request address not in body
            },
            user_posts: function(callback) {
                Post.find({ user: req.params.id }).exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.user == null) {
                // No results.
                res.json({ success: false, error: "User doesn't exist" }).redirect('/users');
            }
            // Successful, so render.
            res.render('user_delete', { title: 'Delete User', user: results.user, user_posts: results.user_posts, });
        }
    );
};
// Handle User delete on POST.
exports.user_delete_post = function(req, res, next) {
    async.parallel({
            user: function(callback) {
                User.findById(req.body.userid).exec(callback); // User id is in body not in the request
            },
            user_posts: function(callback) {
                Post.find({ user: req.body.userid }).exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            // Success.
            if (results.user_posts.length > 0) {
                // User has posts. Render in same way as for GET route.
                res.render('user_delete', { title: 'Delete User', user: results.user, user_posts: results.user_posts, });
                return;
            } else {
                // User has no posts. Delete object and redirect to the list of users.
                User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
                    if (err) {
                        return next(err);
                    }
                    // Success - go to user list.
                    res.redirect('/users');
                });
            }
        }
    );
};
// Display User update form on GET.
exports.user_update_get = function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }
        if (user == null) {
            // No results.
            let err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user_form', { title: 'Update User', user: user });
    });
};
// Handle User update on POST.
exports.user_update_post = [
    // Validate and santize fields.
    body('username').trim().isLength({ min: 1 }).escape().withMessage('username must be specified.').isAlphanumeric().withMessage('username has non-alphanumeric characters.'),
    body('email').isEmail(),
    body('birth_date', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('password').trim().isLength({ min: 6 }).escape().withMessage('password must be specified.').isAlphanumeric().withMessage('password has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create User object with escaped and trimmed data (and the old id!)
        const user = new User({ username: req.body.username, email: req.body.email, birth_date: req.body.birth_date, password: bcrypt.hashSync(req.body.password + pepper, parseInt(salt)), _id: req.params.id, });
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('user_form', { title: 'Update User', user: user, errors: errors.array(), });
            return;
        } else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(
                req.params.id,
                user, {},
                function(err, theuser) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to genre detail page.
                    res.redirect(theuser.url);
                }
            );
        }
    },
];