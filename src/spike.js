const express = require('express');
const superagent = require('superagent');
const app = express();
app.use(express.static('public'));

const MERCHANT_EMAIL = "skrillevaluation1@vgw.co";

app.post('/purchase/skrill', async (req, res) => {

    try {
        const result = await superagent.post('https://pay.skrill.com')
            .send('pay_to_email=' + MERCHANT_EMAIL)
            .send('amount=8.00')
            .send('currency=USD')
            .send('language=EN')
            .send('payment_type=WLT')
            .send('prepare_only=1')
            .send('return_url=https://casino-devb.dev.chumbacasino.com/')
            .send('return_url_text=Back to Chumba Casino Lobby!')
            .send(`status_url=https://requestbin.vgwholdings.net/${process.env.BIN_NUMBER}`)
            .send('pay_from_email=skrillevaluation3@vgw.co')
            .send('detail1_description=Description: ')
            .send('detail1_text=Purchase 250,000 Gold + $5.00 worth of Sweeps')
            .send('logo_url=https://d3e5cxfsrl1n2s.cloudfront.net/build/master-1321/casino_vue/images/desktop/logo.png')
            .send('dynamic_descriptor=Chumba Casino');

        const sid = result.text;
        console.log('sid', sid)
        res.redirect(`https://pay.skrill.com/?sid=${sid}`);
    }
    catch (err) {
        console.error("Skrill prepare failed", err)
    }    
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));