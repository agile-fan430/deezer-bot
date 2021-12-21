const { spawn, Worker } = require('threads');
const { getAccountList } = require('./services/account.service');

(async() => {
    let accountList = await getAccountList();
    for(var i=0; i<accountList.length; i++) {
      const run = await spawn(new Worker('./main.js'));
      run(accountList[i]);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30000);   //wait 80s for for one bot to completely login and start
    }
})();