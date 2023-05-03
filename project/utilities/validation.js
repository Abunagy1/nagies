const Joi = require("joi");

const registerValidation = (data) => {
    const schema = Joi.object.keys({
        username: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        birth_date: Joi.date().required(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object.keys({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};


const validateRequest = (schema) => async(req, res, next) => {
    const { error } = Joi.validate(req.body, schema);
    if (error) {
        throw new Error(error);
    }
    return next();
};

module.exports = {
    registerValidation,
    loginValidation,
    validateRequest,
};