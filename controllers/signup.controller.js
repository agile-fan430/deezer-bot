const { sleep } = require('../utils/helper');
const { signedUp, changePassword } = require('../services/account.service');
const fetch = require('node-fetch');

async function signup(page, accountInfo) {
    await page.goto('https://www.deezer.com/us/register', {waitUntil: 'load', timeout: 0});

    console.log('here');
    await page.waitFor(10000);
    try {
      let cookieBtn = await page.$('.cookie-btn');
      await cookieBtn.click();
    } catch(e) {
      console.log(e);
    }

    await page.waitFor(2000);

    var signupPopupPromise = new Promise(x => page.once('popup', x));

    try {
      let googleButton = await page.$('#home_account_gp');
      await googleButton.click();
    } catch(e) {
      console.log('error on google button', e);
    }
    await page.waitFor(10000);

    var googleSignup = await signupPopupPromise;


    try {
        let emailInput = await googleSignup.$('#identifierId');
        await emailInput.type(accountInfo.email);
        await emailInput.type(String.fromCharCode(13));
    
        await googleSignup.waitFor(15000);
        await googleSignup.waitForSelector('input[name="password"]');

        let passwordInput = await googleSignup.$('input[name="password"]');
        await passwordInput.type(accountInfo.pwd);
        await passwordInput.type(String.fromCharCode(13));
    
        await googleSignup.waitFor(5000);
    } catch(err) {
        await googleSignup.close();
        await page.waitFor(3000);

        signupPopupPromise = new Promise(x => page.once('popup', x));

        let googleButton = await page.$('#home_account_gp');
        await googleButton.click();
    
        await page.waitFor(10000);

        googleSignup = await signupPopupPromise;
        let emailInput = await googleSignup.$('#identifierId');
        await emailInput.type(accountInfo.email);
        await emailInput.type(String.fromCharCode(13));
    
        await googleSignup.waitFor(15000);
        await googleSignup.waitForSelector('input[name="password"]');
    
        let passwordInput = await googleSignup.$('input[name="password"]');
        await passwordInput.type(accountInfo.pwd);
        await passwordInput.type(String.fromCharCode(13));
    
        await googleSignup.waitFor(5000);
    }
    
    try {
        const needSecurityQuestion = await googleSignup.evaluate(() => {
            return document.getElementsByTagName('body')[0].innerHTML.includes('security question');
        });

        if(needSecurityQuestion) {
            try {

                let nextButton = await googleSignup.$('div[role="link"]');
                await nextButton.click();    
            } catch(error) {
                console.log('there is no need to select answer security questions');
            }
            await googleSignup.waitFor(4000);

            let questionInput = await googleSignup.$('#secret-question-response');
            await questionInput.type(accountInfo.security);
            await questionInput.type(String.fromCharCode(13));

            await googleSignup.waitFor(3000);
        }
    } catch(e) {
        console.log('no need security question');
    }

    await googleSignup.waitFor(5000);
    
  try {
    const isSecurityPassword = await googleSignup.evaluate(
      () => {
        console.log(document.getElementsByTagName('body')[0].innerHTML.includes('security question'));
        return document.getElementsByTagName('body')[0].innerHTML.includes('security question');
      }
    )
    if(isSecurityPassword) {
        try {
            await googleSignup.click('form *[role="link"]');
            await googleSignup.waitFor(5000);
        } catch(error) {
            console.log('no need to click answer security questions');
        }
      await googleSignup.type('input', accountInfo.security, {delay: 20});
      await googleSignup.type('input', String.fromCharCode(13));
      await googleSignup.waitFor(5000);
    }

  } catch(error) {
    console.log(error);
    console.log('there is no security questions');
  }
  await googleSignup.waitFor(5000);
  try {
    const isVerifyPhone = await googleSignup.evaluate(
      () => {
        return document.getElementsByTagName('body')[0].innerHTML.includes('Verify your phone number');
      }
    );

    if(isVerifyPhone) {
      await googleSignup.click('a[role="button"]');
      await googleSignup.waitFor(5000);
    }
  } catch(error) {
    console.log('there is no security questions');
  }
  await googleSignup.waitFor(5000);
  try {
    const isConfirmUpdate = await googleSignup.evaluate(
      () => document.getElementsByTagName('body')[0].innerHTML.includes('confirm')
    );
    if(isConfirmUpdate) {
      await googleSignup.evaluate(
        () => {
          document.querySelectorAll('div[role="button"]:last-child').click();
        }
      );
    
      await googleSignup.waitFor(10000);
    }
  } catch(error) {
    console.log('there is no security questions');
  }

  await googleSignup.waitFor(5000);
  try {
    const isSMSVerify = await googleSignup.evaluate(
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
      await googleSignup.type('#phoneNumberId', phoneNumber);
      await googleSignup.type('#phoneNumberId', String.fromCharCode(13));

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
      await googleSignup.waitFor(5000);
      await googleSignup.type('#idvAnyPhonePin', sms);
      await googleSignup.type('#idvAnyPhonePin', String.fromCharCode(13));
      
      await googleSignup.waitFor(5000);
    }
  } catch(error) {
    console.log(error);
    console.log('there is no phone verification');
  }

  await googleSignup.waitFor(5000);
  try {
    const isChangePassword = await googleSignup.evaluate(
      () => document.getElementsByTagName('body')[0].innerHTML.includes("Change password")
    );
    if(isChangePassword) {
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      var string_length = 8;
      var randomstring = '';
      for (var i=0; i<string_length; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum,rnum+1);
      }
      await googleSignup.type('input[name="Passwd"]', randomstring);

      await googleSignup.waitFor(1000);
      await googleSignup.type('input[name="ConfirmPasswd"]', randomstring);
      await googleSignup.type('input[name="ConfirmPasswd"]', String.fromCharCode(13));

      changePassword(accountInfo.id, randomstring);
      await googleSignup.waitFor(3000);

    }
  } catch(error) {
    console.log('no change password');
  }
 await googleSignup.waitFor(15000);

 
 try {
    try {
        let allowButton = await googleSignup.$('#submit_approve_access');
        await allowButton.click();
    } catch(error) {
        console.log('no need to input allow button');
    }

    await page.waitForSelector('.onboarding-screen-artist-item-image-wrapper');
    await page.waitFor(15000);

    let artistButtons = await page.$$('.onboarding-screen-artist-item-image-wrapper');

    await artistButtons[0].click();
    await artistButtons[1].click();
    await artistButtons[2].click();
    await artistButtons[3].click();
    await artistButtons[4].click();

    let finishButton = await page.$('.onboarding-screen-search-btn');
    await finishButton.click();

    await signedUp(accountInfo.id);
} catch(error) {
    console.log('no need to add basic info');
}

    await page.waitFor(20000);
}

module.exports = {
    signup
}