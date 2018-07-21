'use strict'
const cors = require('cors')
const express = require('express');
const path = require('path');
const log4js = require('log4js')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const config = require('./config.json')
const tokenProvider = require('./token.js')
const transferRLT = require('./transferRlt.js')
const investment = require('./investment.js')
const helper = require('./helper.js')
const wallet = require('ethereumjs-wallet')

app.options('*', cors())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Set Logger
const logger = log4js.getLogger('app')

////////////////// Start Server //////////////////////////////////////////
http.createServer(app).listen(80, "35.229.70.206");

console.log('Server running at http://35.229.70.206:80/');
///////////////////////////////////////////////////////////////////////////
helper.setAbi()


app.get('/create/wallet/:passphrase', async function (req, res) {
  if(req.params.passphrase!==''){
    let walletObj = await wallet.generate(req.params.passphrase)
    if (walletObj.getAddressString()==''){
      res.send({sucess:false,message:'Unable to create wallet'})  
    }else{
      let responseObj = {
        success : true,
        message : "Wallet created successfully!",
        WalletAddress : walletObj.getAddressString(),
        privateKey : walletObj.getPrivateKeyString(),
        keyValueJson : walletObj.toV3(req.params.passphrase)
      }
      res.send(responseObj);
    }
  }else{
    res.send({sucess:false,message:'Please provide passphrase to create wallet'})
  }
})

function returnTokenCode(tokenName, res){

   if (tokenName == 'RLT') {
    return 1
   } if (tokenName == 'RMA' ) {
     return 2
   }else if (tokenName == 'RMB' ) {
     return 3
   }
 res.send({success:false,message:'Please provide valid token name', data:{ "transaction ID": null }} )

}


app.get('/account/balance/:address/:tokenSymbol', async function (req, res) {
  let token = tokenProvider.token()
console.log(req.params.tokenSymbol)
  let tokenValue =   returnTokenCode(req.params.tokenSymbol,res)
console.log(tokenValue)
  token.balanceOf.call(req.params.address, tokenValue , function (err, balance) {
    res.send({success:true,message:'', data:{ "balance": balance }} )
  })
})

app.get('/account/balance/vested/:address/:tokenSymbol', async function (req, res) {
  let token = tokenProvider.token()
console.log(req.params.tokenSymbol)
  let tokenValue =   returnTokenCode(req.params.tokenSymbol,res)
console.log(tokenValue)
  token.vestedBalance.call(req.params.address, tokenValue , function (err, balance) {
    res.send({success:true,message:'', data:{ "balance": balance }} )
  })
})



// TODO : Private Key to sign Transaction must be stored in OS environment , and access by Procee - as test it is in config file
// Transfer RLT to Other Account
app.post('/transfer', async function (req, res) {
  let toAddress = req.body.toAddress
  let tokenValue = req.body.tokenValue
  let trSender = req.body.trSender
  let privatekey = req.body.privatekey
  let tokenSymbol = returnTokenCode(req.body.tokenSymbol,res)
  let transactionId = await transferRLT.transferRLT(toAddress, tokenValue, privatekey, trSender, tokenSymbol)
  if(transactionId.success==false){
    res.send({success:false,message:transactionId, data:{ "transaction ID": null }} )
  }else{
    res.send({success:true,message:'', data:{ "transaction ID": transactionId }} )
  }
})


// Invest RLT
app.post('/invest', async function (req, res) {
  let toAddress = req.body.toAddress
  let investedValue = req.body.investedValue
  let privatekey = req.body.privatekey
  let trSender = req.body.trSender
  let tokenSymbol = 1
  let transactionId = await investment.investment(toAddress, investedValue, privatekey, trSender, tokenSymbol)
  if(transactionId.success==false){
    res.send({success:false,message:transactionId, data:{ "transaction ID": null }} )
  }else{
    res.send({success:true,message:'', data:{ "transaction ID": transactionId }} )
  }
})


// D-Invest RLT
app.post('/dinvest', async function (req, res) {
  let fromAddress = req.body.fromAddress
  let dinvestValue = req.body.dinvestValue
  let privatekey = req.body.privatekey
  let trSender = req.body.trSender
  let tokenSymbol = 1
  let transactionId = await investment.dinvestment(fromAddress, dinvestValue, privatekey, trSender, tokenSymbol)
  if(transactionId.success==false){
    res.send({success:false,message:transactionId, data:{ "transaction ID": null }} )
  }else{
    res.send({success:true,message:'', data:{ "transaction ID": transactionId }} )
  }
})


// Get Transaction receipt 
app.get('/:trHash/tranasction/receipt', async function (req, res) {
  let web3  = helper.web3Obj()
  web3.eth.getTransactionReceipt(req.params.trHash, function (error, result) {
    if (!error) {
      if(result.logs.length>0){
        res.send({success:true,message:'', data:result})
      }else{
        res.send({success:false,message:'Transaction executed but no action performed as requested on blockchain', data:result})
      }
    } else {
      res.send({success:false,message:'Failed to get receipt againt transaction id : '+req.params.trHash})
    }
  })
})
//==================================== END POINTS END HERE =============================
