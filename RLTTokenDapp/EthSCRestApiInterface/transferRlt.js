/////////// TRANFER TOKEN FROM TOKEN OWNER TO OTHER ACCOUNT ///////////////
const helper = require('./helper.js')
const SolidityFunction = require("web3/lib/web3/function")
const lodash = require('lodash')
const transaction = require('./transaction.js')

var transferRLT = async function (toAddress, rltValue , privatekey, trSender , tokenid) {
        let solidityFunction = new SolidityFunction('', lodash.find(abi, { name: 'transfer' }), '')
        var data = solidityFunction.toPayload([toAddress, rltValue, tokenid]).data;
        return await transaction.executeTransaction(data , privatekey, trSender)
}

exports.transferRLT = transferRLT;