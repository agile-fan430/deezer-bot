const axios = require('axios');
require('dotenv').config();
const { BASE_URL } = require('../constants');
const bot_id = process.env.BOT_ID;

async function getAccountList() {
  const req_url = BASE_URL + `/api/customers?bot_id=${bot_id}`;
  var response = await axios.get(req_url);
  return response.data;
}

async function signedUp(accountId) {
  const req_url = BASE_URL + `/api/customers/created?id=${accountId}`;
  var response = await axios.get(req_url);
  return response.data;
}

async function changePassword(id, password) {
  const req_url = BASE_URL + `/api/customers/changePassword?id=${id}&&password=${password}`;
  var response = await axios.get(req_url);
  return response.data;
}

module.exports = {
  getAccountList,
  signedUp,
  changePassword
}