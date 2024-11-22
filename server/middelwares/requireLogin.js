const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User-model.js');

require('dotenv').config();

module.exports = (req, res, next) => {
    const jwtSecret =  process.env.jwtSecret
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in to add a post" });
    }
    const token = authorization.replace("bearer ", "");
    jwt.verify(token, jwtSecret, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "You must be logged in to add a post" });
        }
        const { _id } = payload;
        User.findById(_id).then(userData => {
            if (!userData) {
                return res.status(401).json({ error: "User not found. Please log in again." });
            }
            req.user = userData;
            next();
        }).catch(err => {
            return res.status(500).json({ error: "Internal Server Error 1" });
        });
    });
};
