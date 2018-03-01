pragma solidity 0.4.19;

import { BasicToken } from "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Token contract for tests
 * @author Jakub Stefanski (https://github.com/jstefanski)
 * @author Wojciech Harzowski (https://github.com/harzo)
 */
contract TestToken is BasicToken, Ownable {

    string public name;

    string public symbol;

    modifier onlyNotEmpty(string str) {
        require(bytes(str).length > 0);
        _;
    }

    function TestToken(
        string _name,
        string _symbol
    )
        public
        onlyNotEmpty(_name)
        onlyNotEmpty(_symbol)
    {
        name = _name;
        symbol = _symbol;
    }
}
