const axios = require('axios');
const { BASE_URL } = require('../constants');

async function sendLogs(id, logs, type) {
  await axios.post(BASE_URL + '/api/logs', {
    id,
    logs,
    type
  });
  return true;
}

async function getSetting() {
  var response = await axios.get(BASE_URL + '/api/setting');
  return response.data;
}

async function getCard() {
  var response = await axios.get(BASE_URL + '/api/card/getOne');
  return response.data;
}

async function usedCard(id) {
  await axios.get(BASE_URL + `/api/card/used/${id}`);
  return true;
}

module.exports = {
  sendLogs,
  getSetting,
  getCard,
  usedCard
}