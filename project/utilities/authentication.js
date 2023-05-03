const jwt = require('jsonwebtoken');
//const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// const { TOKEN_SECRET } = process.env;
const secret = process.env.TOKEN_SECRET

exports.createAuthToken = (User) => {
    return jwt.sign(User, secret);
};

exports.verifyAuthToken = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader ? authorizationHeader.split(' ')[1] : '';
        jwt.verify(token, secret);
        next();
    } catch (err) {
        res.status(401)
        res.json(`An error occurred: ${err}`)
        return
    }
};