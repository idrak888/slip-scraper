const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
var port = process.env.PORT || 3100;

const extract = async slipNumber => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox'
        ] 
    });
    const page = await browser.newPage();
    
    await page.goto('http://www.appointment.bdhckl.gov.bd/', { waitUntil: 'networkidle2' })
    
    await page.type('#slip', slipNumber);
    await page.click('body > div.main-container > div > div:nth-child(1) > div > div > article > div > div:nth-child(3) > div > form > div:nth-child(2) > div.col-md-3.col-sm-3.col-xs-5 > input');
    await page.waitFor(1000);

    const result = await page.evaluate(() => {
        const error = document.querySelector("#error");
        if (error.textContent == "") {
            return "Slip available!";
        } else {
            return "Slip not available";
        }     
    });

    browser.close();
    return result;
}

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Expose-Headers", "X-Auth");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth");
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
	}
	next();
});

app.use(bodyParser.json());

app.post("/", (req, res) => {
    extract(req.body.slipNumber).then(result => {
        res.send(result);
    }).catch(e => {
        console.log(e);
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});