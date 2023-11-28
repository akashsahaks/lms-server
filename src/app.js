const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LMS Server",
    });
});

module.exports = app;
