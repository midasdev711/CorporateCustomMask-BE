require("dotenv").config();
var config = require("../config");
var axios = require('axios');

exports.getCities = async (req, res) => {
  var countryId = req.query.countryId;
  var stateId = req.query.stateId;
  var cities = [];
  var headers = { 'Content-Type': 'application/json', Accpet: '*/*' };
  var geodata = await axios.post(`https://geodata.solutions/api/api.php?type=getCities&countryId=${countryId}&stateId=${stateId}&addClasses=cities`, {}, headers);
  for (let key in geodata.data.result) {
    cities.push({
      value: key,
      text: geodata.data.result[key]
    });
  }
  res.status(200).json(cities);
};

exports.getStates = async (req, res) => {
  var countryId = req.query.countryId;
  var states = [];
  var headers = { 'Content-Type': 'application/json', Accpet: '*/*' };
  var geodata = await axios.post(`https://geodata.solutions/api/api.php?type=getStates&countryId=${countryId}&addClasses=states`, {}, headers);
  for (let key in geodata.data.result) {
    states.push({
      value: key,
      text: geodata.data.result[key]
    });
  }
  res.status(200).json(states);
};

exports.getCountries = async (req, res) => {
  var countries = [];
  var headers = { 'Content-Type': 'application/json', Accpet: '*/*' };
  var geodata = await axios.post(`https://geodata.solutions/api/api.php?type=getCountries&addClasses=countries`, {}, headers);
  for (let key in geodata.data.result) {
    countries.push({
      value: key,
      text: geodata.data.result[key]
    });
  }
  res.status(200).json(countries);
};
