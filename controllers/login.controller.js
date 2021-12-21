const { sleep } = require('../utils/helper');
const { changePassword } = require('../services/account.service');
const fetch = require('node-fetch');

async function login(page, accountInfo) {
  try{
    page = await enterEmailPassword(page, accountInfo);
  } catch(error) {
    try {
      page = await enterEmailPassword(page, accountInfo);
    } catch(error) {
      try {
        page = await enterEmailPassword(page, accountInfo);
      } catch(error) {
        try {
          page = await enterEmailPassword(page, accountInfo);
        } catch(error) {
          try {
            page = await enterEmailPassword(page, accountInfo);
          } catch(error) {
            try {
              page = await enterEmailPassword(page, accountInfo);
            } catch(error) {
              try {
                page = await enterEmailPassword(page, accountInfo);
              } catch(error) {
                page = await enterEmailPassword(page, accountInfo);
              }
            }
          }
        }
      }
    }
  }
  await page.waitFor(5000);

  try {
    const isSecurityPassword = await page.evaluate(
      () => {
        console.log(document.getElementsByTagName('body')[0].innerHTML.includes('security question'));
        return document.getElementsByTagName('body')[0].innerHTML.includes('security question');
      }
    )
    if(isSecurityPassword) {
      await page.click('form *[role="link"]');
      await page.waitFor(5000);
      await page.type('input', accountInfo.security, {delay: 20});
      await page.type('input', String.fromCharCode(13));
      await page.waitFor(5000);
    }

  } catch(error) {
    console.log(error);
    console.log('there is no security questions');
  }
  await page.waitFor(5000);
  try {
    const isVerifyPhone = await page.evaluate(
      () => {
        return document.getElementsByTagName('body')[0].innerHTML.includes('Verify your phone number');
      }
    );

    if(isVerifyPhone) {
      await page.click('a[role="button"]');
      await page.waitFor(5000);
    }
  } catch(error) {
    console.log('there is no security questions');
  }
  await page.waitFor(5000);
  try {
    const isConfirmUpdate = await page.evaluate(
      () => document.getElementsByTagName('body')[0].innerHTML.includes('confirm')
    );
    if(isConfirmUpdate) {
      await page.evaluate(
        () => {
          document.querySelectorAll('div[role="button"]:last-child').click();
        }
      );
    
      await page.waitFor(10000);
    }
  } catch(error) {
    console.log('there is no security questions');
  }

  await page.waitFor(5000);
  try {
    const isSMSVerify = await page.evaluate(
      () => document.getElementsByTagName('body')[0].innerHTML.includes("phone number")
    );
    if(isSMSVerify) {
      var getPhoneNumberUrl = `http://smspva.com/priemnik.php?metod=get_number&country=US&service=opt1&apikey=mR8mYzz4blIdc71sKTnMKWDFhioKw0`;
      var response = await fetch(getPhoneNumberUrl);
      
      let result = await response.json();
      console.log(result);
      while(result.response !== "1") {
        response = await fetch(getPhoneNumberUrl);
        result = await response.json();
        console.log(result);
      }
      
      console.log(result);
      var phoneNumber = "+1" + result.number;
      await page.type('#phoneNumberId', phoneNumber);
      await page.type('#phoneNumberId', String.fromCharCode(13));

      await sleep(20000);
      var getSmsUrl = `http://smspva.com/priemnik.php?metod=get_sms&country=US&service=opt1&id=${result.id}&apikey=mR8mYzz4blIdc71sKTnMKWDFhioKw0`;
      
      var smsResponse = await fetch(getSmsUrl);
      result = await smsResponse.json();
      console.log(result);
      var call_time = 0;
      while(result.response !== "1" && call_time < 8) {
        await sleep(30000);
        smsResponse = await fetch(getSmsUrl);
        result = await smsResponse.json();
        call_time ++;
      }

      if(result.response !== "1") {
        return -1;
      }

      var sms = result.sms;
      await page.waitFor(5000);
      await page.type('#idvAnyPhonePin', sms);
      await page.type('#idvAnyPhonePin', String.fromCharCode(13));
      
      await page.waitFor(5000);
    }
  } catch(error) {
    console.log(error);
    console.log('there is no phone verification');
  }

  await page.waitFor(5000);
  try {
    const isChangePassword = await page.evaluate(
      () => document.getElementsByTagName('body')[0].innerHTML.includes("Change password")
    );
    if(isChangePassword) {
      await page.type('input[name="Passwd"]', 'Android1234!');

      await page.waitFor(1000);
      await page.type('input[name="ConfirmPasswd"]', 'Android1234!');
      await page.type('input[name="ConfirmPasswd"]', String.fromCharCode(13));

      changePassword(accountInfo.id);
      await page.waitFor(3000);

    }
  } catch(error) {
    console.log('no change password');
  }

  return 1;
}

async function enterEmailPassword(page, accountInfo) {
  await page.goto('https://stackoverflow.com/users/signup?ssrc=head&returnurl=%2fusers%2fstory%2fcurrent');
  await page.waitFor(5000);

  await page.click('button[data-provider="google"]');
  await page.waitFor(4000);

  let checkUrl = await page.evaluate(() => location.href);
  checkUrl = checkUrl + '&hl=en';

  await page.goto(checkUrl);
  await page.waitFor(5000);

  await page.waitForSelector('#identifierId');
  await page.type('#identifierId', accountInfo.email, {delay: 40});
  await page.type('#identifierId', String.fromCharCode(13));

  await page.waitFor(4000);
  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', accountInfo.pwd, {delay: 60});
  await page.type('input[name="password"]', String.fromCharCode(13));

  return page;
}

module.exports = {
  login
}