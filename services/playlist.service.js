const axios = require('axios');
const { BASE_URL } = require('../constants');

async function getAlbumList() {
  var response = await axios.get(BASE_URL + '/api/album');
  return response.data;
}

async function getTrackList() {
  var response = await axios.get(BASE_URL + '/api/track');
  return response.data;
}

async function getArtistList() {
  var response = await axios.get(BASE_URL + '/api/artist');
  return response.data;
}

module.exports = {
  getAlbumList,
  getTrackList,
  getArtistList
}