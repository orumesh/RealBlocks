/////////// TRANFER TOKEN FROM TOKEN OWNER TO OTHER ACCOUNT ///////////////
const helper = require('./helper.js')
const SolidityFunction = require("web3/lib/web3/function")
const lodash = require('lodash')
const transaction = require('./transaction.js')

var investment = async function (toAddress, investedValue, privatekey, trSender , tokenSymbol) {
    let solidityFunction = new SolidityFunction('', lodash.find(abi, { name: 'investment' }), '')
    var data = solidityFunction.toPayload([toAddress, investedValue, tokenSymbol]).data;
    return await transaction.executeTransaction(data,privatekey, trSender)
}

var dinvestment =async function (fromAddress, dinvestValue, privatekey, trSender, tokenSymbol) {
    let solidityFunction = new SolidityFunction('', lodash.find(abi, { name: 'dinvestment' }), '')
    var data = solidityFunction.toPayload([fromAddress, dinvestValue, tokenSymbol]).data;
    return await transaction.executeTransaction(data,privatekey, trSender)
}

exports.investment = investment;
exports.dinvestment = dinvestment;