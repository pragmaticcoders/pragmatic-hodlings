pragma solidity 0.4.19;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";
import { BasicToken } from "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";


/**
 * @title Proportionally distribute contract's tokens to each employee
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract Holder is Ownable {

    using SafeMath for uint256;

    struct Employee {
        address account;
        uint32 joinTimestamp;
    }

    Employee[] private employees;

    modifier onlyIfEmployeesExist {
        require(employees.length != 0);
        _;
    }

    modifier onlyEmployed(address account) {
        require(isEmployed(account) == true);
        _;
    }

    modifier onlyNotEmployed(address account) {
        require(isEmployed(account) == false);
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

    /**
    * @dev New employee registered
    * @param account address The employee address
    * @param joinTimestamp uint32 Timestamp, when employee joined to company
    */
    event EmployeeRegistered(address account, uint32 joinTimestamp);

    /**
     * @dev Employee fired
     * @param account address Fired employe address
     */
    event EmployeeFired(address account);

    function registerEmployee(address account, uint32 joinTimestamp)
        public
        onlyOwner
        onlyNotEmployed(account)
    {
        employees.push(
            Employee({
                account: account,
                joinTimestamp: joinTimestamp
            }));

        EmployeeRegistered(account, joinTimestamp);
    }

    function fireEmployee(address account)
        public
        onlyOwner
    {
        uint256 firedIndex = getEmployeeIndex(account);

        delete employees[firedIndex];
        employees[firedIndex] = employees[employees.length - 1];
        employees.length--;

        EmployeeFired(account);
    }

    /**
     * @dev Settles given token on employees addresses
     * @param token BasicToken The token to settle
     */
    function settleToken(BasicToken token)
        public
        onlyOwner
        onlyIfEmployeesExist
        onlySufficientAmount(token)
    {
        uint256 tokenAmount = token.balanceOf(this);

        uint256[] memory tokenShares = calculateShares(tokenAmount);

        for (uint i = 0; i < employees.length; i++) {
            token.transfer(employees[i].account, tokenShares[i]);
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

    function getEmployees() public view returns (address[], uint32[]) {
        address[] memory employeesAddresses = new address[](employees.length);
        uint32[] memory employeesTimestamps = new uint32[](employees.length);

        for (uint256 i = 0; i < employees.length; i++) {
            employeesAddresses[i] = employees[i].account;
            employeesTimestamps[i] = employees[i].joinTimestamp;
        }

        return (employeesAddresses, employeesTimestamps);
    }

    function isEmployed(address account) public view returns (bool) {
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].account == account) {
                return true;
            }
        }
    }

    function getEmployeeIndex(address account)
        internal
        onlyEmployed(account)

        returns (uint256)
    {
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].account == account) {
                return i;
            }
        }
        assert(false);
    }
}
