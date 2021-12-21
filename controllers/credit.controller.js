const { getCard, usedCard } = require('../services/setting.service');

async function inputCredit(browser, page, accountInfo) {
    try {
        await page.waitFor(5000);

        await page.mouse.click(10, 10);
        try {
            let tryIt = await page.$('.push-header-container a');
            await tryIt.click();
        } catch(er) {
            console.log('no popup');
        }
        await page.waitFor(3000);
        await page.mouse.click(10, 10);
        try {
            console.log('try to click on alert link');
            const isNotPremium = await page.evaluate(() => {
                return document.querySelector('body').innerHTML.includes('Listen to full length tracks on Deezer.com with Deezer Premium');
            });
            // let links = await page.$$('.alert-wrapper a');
            if(isNotPremium) {
                await page.goto('https://deezer.com/us/offers');
            }
        } catch(error) {
            console.log('no need to click background link');
        }
        await page.waitFor(10000);
        
        try {
            let tryNow = await page.$$('.unlogged-plan-btn-info a');
            await tryNow[1].click();    
        } catch(error) {
            await page.mouse.click(10, 10);
            try {
                let tryIt = await page.$('.push-header-container a');
                await tryIt.click();
            } catch(er) {
                console.log('no popup');
            }
            await page.waitFor(3000);
            await page.mouse.click(10, 10);
            try {
                console.log('try to click on alert link');
                const isNotPremium = await page.evaluate(() => {
                    return document.querySelector('body').innerHTML.includes('Listen to full length tracks on Deezer.com with Deezer Premium');
                });
                // let links = await page.$$('.alert-wrapper a');
                if(isNotPremium) {
                    await page.goto('https://deezer.com/us/offers');
                }
            } catch(error) {
                console.log('no need to click background link');
            }
            await page.waitFor(10000);
        }
        await page.waitFor(10000);
        //select credit card info input group
        let cardPanel = await page.$('#mops-item-cb');
        await cardPanel.click();
    
        //input card information on credit card
        await page.waitFor(3000);

        let card = await getCard();
    
        //pressing tab key for focusing on credit card information
        await page.keyboard.press("Tab");
        //input card no
        await page.keyboard.type(card[0].cardNo);
        await page.keyboard.press("Tab");
    
        await page.waitFor(2000);
        //input expiry date
        await page.keyboard.type(card[0].expiry);
        await page.keyboard.press("Tab");
    
        await page.waitFor(2000);
    
        //input security code
        await page.keyboard.type(card[0].securitycode);
        await page.keyboard.press("Tab");
        await page.waitFor(2000);
    
        //input card holder name
        await page.keyboard.type(accountInfo.name);
    
        await page.waitFor(2000);
        let subscribeBtn = await page.$('#mops-item-submitbutton-cb');
        await subscribeBtn.click();
    
        await page.waitFor(10000);

        await usedCard(card.id);
    } catch(err) {
        console.log(err);
        console.log('no need to input credit card info'); 
    }
}

module.exports = {
    inputCredit
}