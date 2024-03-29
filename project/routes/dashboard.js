const routes = require("express").Router();

// dashboard route
routes.get("/", (req, res) => {
    res.json({
        error: null,
        data: {
            title: "My dashboard",
            content: "dashboard content",
            user: req.user,
        },
    });
});

module.exports = routes;