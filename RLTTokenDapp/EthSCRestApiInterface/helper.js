/////////// HELPER  ///////////////

var Web3 = require('web3')
const config = require('./config.json')

var web3Obj =  function () {
    if (typeof window !== 'undefined' && typeof window.Web3 === 'undefined') {
         window.Web3 = Web3;
    }
    
    const web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(config.network))
    return web3
}

var setAbi = function (){
    global.abi =[]
    abi.push({
        constant:false,
        inputs:[{name:'_to',type:'address'},{name:'_value',type:'uint256'},{name:'tokenId',type:'uint256'}],
        name:'transfer',
        outputs:[{name:'success',type:'bool'}],
        payable:false,
        constant: false,
        type:'function'
    })

    abi.push({
        inputs:[{name:'_owner',type:'address'},{name:'tokenId',type:'uint256'}],
        name:'balanceOf',
        outputs:[{name:'rltBalance',type:'uint256'}],
        payable:false,
        constant: true,
        type:'function'
    })
    
    abi.push({
        inputs:[{name:'_ownerVested',type:'address'},{name:'tokenId',type:'uint256'}],
        name:'vestedBalance',
        outputs:[{name:'vestedAmount',type:'uint256'}],
        payable:false,
        constant: true,
        type:'function'
    })


    abi.push({
        inputs:[],
        name:'getOwner',
        outputs:[{name:'onerAddress',type:'address'}],
        payable:false,
        constant: false,
        type:'function'
    })

    abi.push({
        inputs:[{name:'_to',type:'address'},{name:'_value',type:'uint256'},{name:'tokenId',type:'uint256'}],
        name:'investment',
        outputs:[{name:'success',type:'bool'}],
        payable:false,
        constant: false,
        type:'function'
    })

    abi.push({
        constant:true,
        inputs:[{name:'_from',type:'address'},{name:'_value',type:'uint256'},{name:'tokenId',type:'uint256'}],
        name:'dinvestment',
        outputs:[{name:'success',type:'bool'}],
        payable:false,
        constant: false,
        type:'function'
    })

}
exports.setAbi = setAbi;
exports.web3Obj = web3Obj;