pragma solidity 0.4.24;

import { MintableToken } from "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


/**
 * @title Token contract for tests
 * @author Jakub Stefanski (https://github.com/jstefanski)
 * @author Wojciech Harzowski (https://github.com/harzo)
 */
contract TestToken is MintableToken {

    string public name;

    string public symbol;

    modifier onlyNotEmpty(string str) {
        require(bytes(str).length > 0);
        _;
    }

    constructor(
        string _name,
        string _symbol,
        uint256 _totalSupply
    )
        public
        onlyNotEmpty(_name)
        onlyNotEmpty(_symbol)
    {
        name = _name;
        symbol = _symbol;
        totalSupply_ = _totalSupply;
    }
}
