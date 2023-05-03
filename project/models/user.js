//const client = require('../database');
//const bcrypt = require('bcrypt');
// import { client } from 'pg'
//import dotenv from 'dotenv'
//import { Order } from "./order";
//dotenv.config()

//const { PEPPER, SALT_ROUNDS } = process.env;
//const pepper = process.env.BCRYPT_PASSWORD;
//const saltRounds = process.env.SALT_ROUNDS;
//const salt = await bcrypt.genSalt(10);  
//const hashPassword = await bcrypt.hash(req.body.password, salt);
//const jwt = require("jsonwebtoken");

// import { User } from '../interfaces/user.interface'
//const User = require("../models/User");
//const PostSchema = require('./post');
//const bcrypt = require("bcryptjs");
//const Joi = require("@hapi/joi");
//const bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');
//const pepper = process.env.BCRYPT_PASSWORD;
//const salt = process.env.SALT_ROUNDS;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({ // we use index in the username and eail to optimize queries that use these fields.
    username: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: { unique: true, sparse: true }, trim: true, min: 6, max: 255 },
    email: { type: String, unique: true, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: { unique: true, sparse: true }, trim: true },
    //email: { type: String, required: true, index: { unique: true, sparse: true }},
    birth_date: { type: Date, required: true, default: Date.now, },
    password: { type: String, trim: true, required: true },
    role: {
        type: String,
        enum: ['student', 'Administrator', 'instructor', 'customer', 'staff'],
        default: 'student'
    },
    //posts: [PostSchema],
}, { collection: "users", timestamps: true }); // timestqmp creates a createdAt and updatedAt field
UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });
/*
UserSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password + pepper, parseInt(salt));
    next();
});
*/
/*
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
// Create a method for setting User passwords
UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
// Create a method to validate passwords
UserSchema.methods.validPassword = function(password) {
 var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
 return this.hash === hash;
var secret = require('../config').secret;
};
// method to create token for the user when created
UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
// method to authenticate the user using the generated token
UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
};

};
*/
module.exports = mongoose.model('User', UserSchema);