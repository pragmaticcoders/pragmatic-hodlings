pragma solidity 0.4.19;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title ERC20 token interface
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract Transferable {
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 amount) public;
}


/**
 * @title Proportionally distribute contract's tokens to each employee
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract Holder is Ownable {

    using SafeMath for uint256;

    struct Employee {
        address addr; // 20 bytes
        uint32 joinTimestamp; // is uint32 enough??
    }

    Employee[] employees;

    event TokenSettled(address tokenAddress, uint256 amount);

    function settleToken(Transferable token)
        public
        onlyOwner
    {
//        uint256 availableAmount = token;

//        TokenSettled(token, availableAmount);
    }

    function calculateProportion()
        internal
        returns (uint256[])
    {

    }
}

