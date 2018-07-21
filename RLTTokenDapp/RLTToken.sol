pragma solidity ^ 0.4.18;

// RLT token defination: IERC20Token Implementation
contract RLTToken  {
    //***************************************** START OF CONTRACT *********************************    

    struct TOKEN{
        string name;
        string symbol;
        uint256 id;
        uint8 decimals;
        uint256 balance;
    }

    // Define Struc to hold investment release requests
    struct dInvestRequest{
        bool fromConsent;
        uint256 frmReleaseValue;
        bool ownerConsent;
        uint256 ownReleaseValue;
        uint256 ownerTokenId;
        uint256 frmTokenId;
    }
    
    // Mapping variables
    mapping(address => TOKEN[]) balances;
    mapping(address => TOKEN[]) vested;
    mapping(address => uint256) dinvest;
    mapping(address => dInvestRequest) releaseRequest;

    address private owner;
    uint public constant _totalRLTSupply = 10000000;
    uint public constant _totalRMASupply = 50000000;
    uint public constant _totalRMBSupply = 50000000;
    
    // Default constructor , it will assign all available tokens to the creator of the token
    function RLTToken() public{
        balances[msg.sender].push(TOKEN("Real Block Token", "RLT",1,3,10000000));
        balances[msg.sender].push(TOKEN("Real Membership A", "RMA",2,1,50000000));
        balances[msg.sender].push(TOKEN("Real Membership B", "RMB",3,1,50000000));
        owner = msg.sender;
    }

    function getOwner() external constant returns(address onerAddress){
        return owner;
    }


    // Get the total token supply
    function totalSupply(uint256 tokenId) external constant returns (uint256 _supplyBalance){
        if (tokenId == 1){
            return _totalRLTSupply;
        }else if(tokenId == 2){
             return _totalRMASupply;
        }else if(tokenId == 3){
             return _totalRMBSupply;
        }
    }


    // Get the account balance of another account with address _owner , tokenSymbol
    function balanceOf(address _owner , uint256 tokenId) external constant returns(uint256 rltBalance){
        return getTokenBalance(_owner,tokenId);
    }

    function getTokenBalance (address _owner, uint256 tokenId) private constant returns(uint256 rltBalance){
        uint arrayLength = balances[_owner].length;
        for (uint i=0; i<arrayLength; i++) {
            if (balances[_owner][i].id == tokenId){
                return balances[_owner][i].balance;
            }
        }
        return 0;
    }
    
    
     function getVestedBalance (address _owner, uint256 tokenId) private constant returns(uint256 rltBalance){
        uint256 balance = 0;
        uint arrayLength = vested[_owner].length;
        for (uint i=0; i<arrayLength; i++) {
            if (vested[_owner][i].id == tokenId){
                return vested[_owner][i].balance;
            }
        }
        return balance;
    }
    
    function getTokenById(uint256 id, uint256 _value) private returns(TOKEN tkn){
        if (id == 1){
            return TOKEN("Real Block Token", "RLT",1,3,_value);
        }else if (id == 2 ){
            return TOKEN("Real Membership A", "RMA",2,1,_value);
        }else if(id == 3){
            return TOKEN("Real Membership B", "RMB",3,1,_value);
        }
    }
    
    
    function setTokenBalance (address addr, uint256 _value, uint256 tokenId, bool isAdd) private returns(bool success){
        uint arrayLength = balances[addr].length;
        bool isUpdateBalance = false;
        for (uint i=0; i<arrayLength; i++) {
            if (balances[addr][i].id ==  tokenId ){
                if(isAdd){
                    balances[addr][i].balance += _value;    
                }else{
                    balances[addr][i].balance -= _value;
                }
                isUpdateBalance = true;
            }
        }
        if (!isUpdateBalance && isAdd){
             balances[addr].push(getTokenById(tokenId,_value));
        }
        return true;
    }
    
    function setTokenVested(address addr, uint256 _value, uint256 tokenId, bool isAdd) private returns(bool success){
        uint arrayLength = vested[addr].length;
        bool isUpdateBalance = false;
        for (uint i=0; i<arrayLength; i++) {
            if (vested[addr][i].id == tokenId){
                 if(isAdd){
                    vested[addr][i].balance += _value;     
                 }else{
                    vested[addr][i].balance -= _value;
                 }
                 isUpdateBalance = true;
            }
        }
        
        if (!isUpdateBalance && isAdd){
             vested[addr].push(getTokenById(tokenId,_value));
        }
        return true;
    }
    
    // Send _value amount of tokens to address _to
    function transfer(address _to, uint256 _value, uint256 tokenId) external returns(bool success){
        uint256 senderBalance = getTokenBalance(msg.sender,tokenId);
        uint256 vestedBalce = getVestedBalance(msg.sender,tokenId);
        if ( tokenId == 1){
            if (_to != owner && _value > 0 && senderBalance >= _value && senderBalance - vestedBalce > 0) {
                setTokenBalance(msg.sender, _value, tokenId , false); // reduce owner balance with value it requires to transfer
                setTokenBalance(_to, _value, tokenId , true); //increase balance of token receiver from the owner
                 emit Transfer(msg.sender, _to, _value); // Raise Event
                return true;
            } else {
                return false;
            }
        }else{
            if (_to != owner && _value > 0 && senderBalance >= _value ) {
                setTokenBalance(msg.sender, _value, tokenId , false); // reduce owner balance with value it requires to transfer
                setTokenBalance(_to, _value, tokenId , true); //increase balance of token receiver from the owner
                emit Transfer(msg.sender, _to, _value); // Raise Event
                return true;
            } else {
                return false;
            }
        }
       
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Investment
    function investment(address _to, uint256 _value , uint256 tokenId) public returns(bool success){
         uint256 senderBalance = getTokenBalance(msg.sender,tokenId);
        // Allow investment in case owner of token is not sending investment to its own account
        // check if who is reserving investement has enough balance
        if (_to != owner && _value > 0 && senderBalance > 0 && senderBalance > _value && msg.sender == owner && tokenId == 1) {
            setTokenVested(_to, _value, tokenId, true);
            setTokenBalance(_to, _value, tokenId, true);
            setTokenBalance(msg.sender, _value, tokenId, false);
            emit Investment(_to, _value);
            return true;
        } else {
            return false;
        }
    }

    // D-Investment
    function dinvestment(address _from, uint256 _value , uint256 tokenId) public returns(bool success){

        if ( (msg.sender == owner || _from == msg.sender) && tokenId == 1) {
            if (msg.sender == owner) {
                releaseRequest[_from].ownerConsent = true;
                releaseRequest[_from].ownReleaseValue = _value;
                releaseRequest[_from].ownerTokenId = tokenId;
                emit Dinvestment(_from, _value);
            } else {
                releaseRequest[_from].fromConsent = true;
                releaseRequest[_from].frmReleaseValue = _value;
                releaseRequest[_from].frmTokenId = tokenId;
                emit Dinvestment(_from, _value);
            }

            if (releaseRequest[_from].fromConsent == releaseRequest[_from].ownerConsent && 
                releaseRequest[_from].frmReleaseValue == releaseRequest[_from].ownReleaseValue &&
                releaseRequest[_from].frmTokenId == releaseRequest[_from].ownerTokenId
                ) {
                   setTokenVested(_from, _value, tokenId, false);
                   delete releaseRequest[_from];
            }
            return true;
        } else {
            return false;
        }
    }

    // Get the account balance of another account with address _owner 
    function vestedBalance(address _investor, uint256 tokenId) public constant returns(uint256 vestedAmount){
        return getVestedBalance(_investor,tokenId);
    }

    event Investment(address indexed _to, uint256 _value);
    event Dinvestment(address indexed _from, uint256 _value);


    //***************************************** END OF CONTRACT *********************************    
}
