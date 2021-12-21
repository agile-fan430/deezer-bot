const { expose } = require('threads');
const { exec } = require('child_process');
const { Worker } = require('worker_threads');
const { getSetting, sendLogs } = require('./services/setting.service');
const webSocketClient = require('websocket').client;
const { WS_URL } = require('./constants');
const fs = require('fs');

let worker;
expose(async (accountInfo) => {
  const setting = await getSetting();
  let playHours = Math.round(Math.random() * (setting[0].max_stream - setting[0].min_stream) + setting[0].min_stream);
  let sleepHours = 24 - playHours;

  let timerWS;
  let client;
  try {
    client = new webSocketClient();

    client.on('connectFailed', function (error) {
      console.log('Connect Failed: ' + error.toString());
    });

    client.on('connect', function (connection) {
      connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
      });
      connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
        timerWS = setInterval(
          () => {
            client.connect(WS_URL, 'echo-protocol');
          }, 20000
        );
      });
      connection.on('message', function (message) {
        clearInterval(timerWS);
      });

      console.log('connected ws');
      clearInterval(timerWS);
      console.log('ws cleared');
      function sendId() {
        if (connection.connected) {
          connection.sendUTF(JSON.stringify({ id: accountInfo.id }));
        }
      }
      sendId();
    });
  } catch (err) {
    console.log(err);
  }

  try {
    console.log('trying to connect ws');
    client.connect(WS_URL, 'echo-protocol');
  } catch (err) {
    console.log(err);
  }

  worker = new Worker('./controllers/main.controller.js', { workerData: { setting, accountInfo } });
  startPlaying(playHours * 3600000, sleepHours * 3600000, accountInfo, setting);
});

function startPlaying(playHours, sleepHours, accountInfo, setting) {
  try {
    let path = 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp';
    // let path = '/Users/abigailduncan/Documents';
    let filename = 'dbot_start.bat';
    if (!fs.existsSync(path + '/' + filename)) {
      let content = `cd ${__dirname}\n` + 'node index.js';
      fs.writeFileSync(`${path}/${filename}`, content, (err) => {
        if (err) {
          console.log('there was an error on write file', err);
        }
      });
    }
  } catch(error) {
    console.log('You should need to run this command in Administrator Mode');
  }
  exec('git pull', (err, stdout, stderr) => {
    console.log(err);
    console.log(stderr);
    console.log(stdout);
  });
  worker.postMessage('start');
  var begin = new Date();
  let timing = setInterval(() => {
    let now = new Date();
    let playTime = now - begin;
    if(playTime > playHours) {
      clearInterval(timing);
      stopPlaying(playHours, sleepHours, accountInfo, setting);
    }
  }, 1000);
}

function stopPlaying(playHours, sleepHours, accountInfo, setting) {
  worker.postMessage('stop');
  worker = null;
  var begin = new Date();
  let timing = setInterval(() => {
    let now = new Date();
    let sleepTime = now - begin;
    if (sleepTime > sleepHours) {
      clearInterval(timing);
      worker = new Worker('./controllers/main.controller.js', { workerData: { setting, accountInfo } });
      startPlaying(playHours, sleepHours, accountInfo, setting);
    }
  }, 1000);
}