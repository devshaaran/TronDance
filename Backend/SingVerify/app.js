var express = require("express");
var app = express();
const TronWeb = require('tronweb')
var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }));

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'your api key' },
    privateKey: '403584315f4750cadd937f4c0b30305ac6d4a7db2a628e8e3d33f88410886ec7'
})

app.get('/test', async (req, res) =>  {
    let message = "0x436c69636b207369676e20746f20656e7465722054726f6e44616e6365"
    let address = "TEp2YwLRBdhLhhtvJoytWoRC8JQFsnVi99"
    let signedMsg = "0x4bc5b51740d1d8c65e80382fa8022ecba35db86ea7845e59b426dc97570905e36ac312b4dfca6324081b4473a1e43f7298fd6a5b3ca0cbef23c716bbd1c76a711c"
    tronWeb.isAddress(address) ? tronWeb.trx.verifyMessage(message, signedMsg, address).then((result) => res.status(200).send({"result": result})).catch((err) => res.status(401).send({"result": false})) : res.status(401).send({"result": false})
});

app.post('/login', async (req, res) => {
    try {
        var message = "0x436c69636b207369676e20746f20656e7465722054726f6e44616e6365";
        var signedMsg = req.body.signedmsg;
        var address = req.body.address;
        tronWeb.isAddress(address) ? tronWeb.trx.verifyMessage(message, signedMsg, address).then((result) => res.status(200).send({"result": result})).catch((err) => res.status(401).send({"result": false})) : res.status(401).send({"result": false})
    } catch (error) {
        console.log(error)
        res.status(500).send({"result": false})
    }

});

app.listen(3000 || process.env.PORT, () => {
 console.log("Server running on port 3000");
});
