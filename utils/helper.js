function generateRandomInt(min, max) {
  let diff = max - min;
  return Math.floor(Math.random() * diff) + min;
}

function convertStringToTime(duration) {
  var timing = duration.split(':');
  return 60 * timing[0] + 1 * timing[1];
}

async function sleep(duration) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration);   //Sleep bot for certain duration
}

function generateRandomSeqArray(length) {
  var result = [];
  for(var i = 0; i < length; i++) {
    result.push(i);
  }

  return shuffle(result);
}

function shuffle(arra1) {
  var ctr = arra1.length, temp, index;

// While there are elements in the array
  while (ctr > 0) {
// Pick a random index
      index = Math.floor(Math.random() * ctr);
// Decrease ctr by 1
      ctr--;
// And swap the last element with it
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
  }
  return arra1;
}

module.exports = {
  convertStringToTime,
  sleep,
  generateRandomInt,
  generateRandomSeqArray
}