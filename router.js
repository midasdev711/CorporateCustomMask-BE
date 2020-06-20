require("dotenv").config();
const express = require("express");
const router = express.Router();
const _ = require("lodash");
var config = require("./config");
var path = require('path');

var maskController = require("./controllers/maskController");
var geoController = require("./controllers/geoController");

router.post("/api/upload", maskController.upload);

router.get("/api/getCities", geoController.getCities);
router.get("/api/getStates", geoController.getStates);
router.get("/api/getCountries", geoController.getCountries);

module.exports = router;
