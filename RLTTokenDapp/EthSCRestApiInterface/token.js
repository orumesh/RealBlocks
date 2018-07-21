/////////// TOKEN CONFIGURATION SETUP ///////////////

const config = require('./config.json')
const helper = require('./helper.js')
//const abi = require('human-standard-token-abi')

// Function add custom functions in ERC20ABI JSON
// Get contract on address provided
// Return token
var token =  function () {
    
    let web3 = helper.web3Obj()
    web3.eth.defaultAccount = config.adminAccount; // set default acoount of eth
    let contract  = web3.eth.contract(abi).at(config.tokenAddress)
    return contract
}

exports.token = token;