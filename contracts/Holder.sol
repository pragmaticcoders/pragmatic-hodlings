pragma solidity 0.4.19;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";
import { BasicToken } from "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";


/**
 * @title Holder contract
 * @dev Proportionally distribute contract's tokens to each employee
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract Holder is Ownable {

    using SafeMath for uint256;

    struct Employee {
        address addr; // 20 bytes
        uint256 joinTimestamp; // is uint32 enough??
    }

    Employee[] private employees;

    modifier onlyEmployees {
        require(employees.length != 0);
        _;
    }

    modifier onlySufficientAmount(BasicToken token) {
        require(token.balanceOf(this) > 0);
        _;
    }

    /**
     * @dev Token is settled on employees addresses
     * @param token address The token address
     * @param amount uint256 Settled amount
     */
    event TokenSettled(address token, uint256 amount);

    // remove this after implementing real addEmployee function
    function addEmployee(address _address)
        public
        onlyOwner
    {
        /* solhint-disable not-rely-on-time */
        Employee memory employee = Employee(_address, now);
        /* solhint-enable not-rely-on-time */
        employees.push(employee);
    }

    /**
     * @dev Settles given token on employees addresses
     * @param token BasicToken The token to settle
     */
    function settleToken(BasicToken token)
        public
        onlyOwner
        onlyEmployees
        onlySufficientAmount(token)
    {
        uint256 tokenAmount = token.balanceOf(this);

        uint256[] memory tokenShares = calculateShares(tokenAmount);

        for (uint i = 0; i < employees.length; i++) {
            token.transfer(employees[i].addr, tokenShares[i]);
        }

        TokenSettled(token, tokenAmount);
    }

    /**
     * @dev Calculates proportional share in given amount
     * @param amount uint256 Amount to share between employees
     * @return tokenShares uint256[] Calculated shares
     */
    function calculateShares(uint256 amount)
        public
        view
        returns (uint256[])
    {
        uint256[] memory tokenShares = new uint256[](employees.length);

        uint256 dayInSeconds = 86400;
        uint256 daysSum = 0;
        for (uint i = 0; i < employees.length; i++) {
            /* solhint-disable not-rely-on-time */
            uint256 employeeSeniority = now.sub(employees[i].joinTimestamp);
            /* solhint-enable not-rely-on-time */
            tokenShares[i] = employeeSeniority.div(dayInSeconds).add(1);
            daysSum = daysSum.add(tokenShares[i]);
        }

        for (i = 0; i < employees.length; i++) {
            tokenShares[i] = amount.mul(tokenShares[i]).div(daysSum);
        }

        return tokenShares;
    }
}

