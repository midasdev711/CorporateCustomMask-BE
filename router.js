require("dotenv").config();
const express = require("express");
const router = express.Router();
const _ = require("lodash");
var config = require("./config");
var path = require('path');

var maskController = require("./controllers/maskController");

router.post("/api/upload", maskController.upload);

module.exports = router;
