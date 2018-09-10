const express = require('express');
const superagent = require('superagent');
const app = express();
app.use(express.static('public'));
const fastXmlParser = require('fast-xml-parser');
const uuidv4 = require("uuid/v4");

const MERCHANT_EMAIL = 'cushla.taylor3@vgw.co';

app.post('/purchase/skrill', async (req, res) => {

    try {
        const result = await superagent.post('https://pay.skrill.com')
            .send(`pay_to_email=${MERCHANT_EMAIL}`)
            .send('amount=80.00')
            .send('currency=USD')
            .send('language=EN')
            .send('payment_methods=WLT')
            .send('prepare_only=1')
            .send('return_url=https://skrill.com/')
            .send('return_url_text=Back to ...!')
            //.send(`status_url=https://requestbin.vgwholdings.net/${process.env.BIN_NUMBER}`)
            .send('pay_from_email=skrillevaluation3@vgw.co')
            .send('detail1_description=Description: ')
            .send('detail1_text=Purchase item')
            .send('logo_url=https://www.freelogodesign.org/Content/img/home-icon-name.png')
            .send('dynamic_descriptor=Org name');

        const sid = result.text;
        console.log('sid', sid)
        res.redirect(`https://pay.skrill.com/?sid=${sid}`);
    }
    catch (err) {
        console.error("Skrill prepare_only failed", err)
    }
});

app.post('/purchase/neteller', async (req, res) => {

    try {
        const result = await superagent.post('https://pay.skrill.com')
            .send('pay_to_email=Netellerevaluation-chu-3@vgw.co')
            .send('amount=10.00')
            .send('currency=USD')
            .send('language=EN')
            .send('payment_methods=NTL')
            .send('prepare_only=1')
            .send('return_url=https://casino-devb.dev.chumbacasino.com/')
            .send('return_url_text=Back to Chumba Casino Lobby!')
            .send(`status_url=https://requestbin.vgwholdings.net/${process.env.BIN_NUMBER}`)
            .send('neteller_account=netellerevaluation2@vgw.co')
            .send('detail1_description=Description: ')
            .send('detail1_text=Purchase 250,000 Gold + $5.00 worth of Sweeps')
            .send('logo_url=https://d3e5cxfsrl1n2s.cloudfront.net/build/master-1321/casino_vue/images/desktop/logo.png')
            .send('dynamic_descriptor=Chumba Casino');

        const sid = result.text;
        console.log('sid', sid)
        res.redirect(`https://pay.skrill.com/?sid=${sid}`);
    }
    catch (err) {
        console.error("Neteller prepare only failed", err)
    }
});

const xmlOpts = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : false,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : false,
    parseAttributeValue : false,
    trimValues: true,
}
const OK = 200
app.post('/redemptions/skrill', async (req, res) => {
    try {
        // action=prepare
        const response = await superagent.post('https://www.skrill.com/app/pay.pl')
            .type('form')
            .send('action=prepare')
            .send('email=cushla.taylor3@vgw.co')
            .send(`password=${process.env.ChuSkrillDev2Key}`)
            .send('amount=5.00')
            .send('currency=USD')
            .send('bnf_email=cushla.taylor2@vgw.co')
            .send('subject="Your winnings have been sent 5!')
            .send('note="see note for details 5')
            .send(`frn_trn_id=${uuidv4().substr(0, 32)}`)        
        
        // successful HTTP request, the HTTP response body 200 is returned
        if (response.statusCode !== OK) {
            console.error('failed', response, response.statusCode)
            res.send(`<p>Error returned!! status code: ${response.statusCode}</p>`);
            return;
        }

        /*
        Success
            <?xml version="1.0" encoding="UTF-8"?>
            <response>
                <sid>5e281d1376d92ba789ca7f0583e045d4</sid>
            </response>
        Error
            <?xml version="1.0" encoding="UTF-8"?>
            <response>
                <error>
                        <error_msg>LOCK_LEVEL_9</error_msg>
                </error>
            </response>
        */
        const prepareJson = fastXmlParser.parse(response.text, xmlOpts);
        if (!prepareJson.response || !prepareJson.response.sid || prepareJson.response.error) {
            console.error('Error', prepareJson.response)
            res.send("<p>Error returned!!</p>");
            return;
        }

        // action=transfer
        const transfer = await superagent.post('https://www.skrill.com/app/pay.pl')
            .send('action=transfer')
            .send(`sid=${prepareJson.response.sid}`)
        
        const transferJson = fastXmlParser.parse(transfer.text, xmlOpts)
        console.log('transfer result', transferJson.response)
        res.send(`<p>Redemption completed: ${JSON.stringify(transferJson.response)}</p?`)

    }
    catch (err) {
        console.error("Transfer failed", err)
    }
});
app.listen(3000, () => console.log('Skrill spike app listening on port 3000!'));