pragma solidity 0.4.19;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";
import { BasicToken } from "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import { HodlersBookLib } from "./HodlersBookLib.sol";


/**
 * @title Proportionally distribute contract's tokens to each registered hodler
 * @dev Proportion is calculated based on joined timestamp
 * @dev Group of hodlers and settlements are managed by contract owner
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract PragmaticHodlings is Ownable {

    using SafeMath for uint256;
    using HodlersBookLib for HodlersBookLib.HodlersBook;

    HodlersBookLib.HodlersBook private hodlers;

    /**
     * @dev Stores addresses added to book
     */
    modifier onlyValidAddress(address account) {
        require(account != address(0));
        _;
    }

    modifier onlyHodlersExist {
        require(hodlers.entries.length != 0);
        _;
    }

    modifier onlyExisting(address account) {
        require(hodlers.contains(account));
        _;
    }

    modifier onlyNotExisting(address account) {
        require(!hodlers.contains(account));
        _;
    }

    modifier onlySufficientAmount(BasicToken token) {
        require(token.balanceOf(this) > 0);
        _;
    }

    modifier onlyPast(uint32 timestamp) {
        // solhint-disable-next-line not-rely-on-time
        require(now > timestamp);
        _;
    }

    /**
    * @dev New hodler has been added to book
    * @param account address Hodler's address
    * @param joinTimestamp uint32 Hodler's joining timestamp
    */
    event HodlerAdded(address account, uint32 joinTimestamp);

    /**
     * @dev Existing hodler has been removed
     * @param account address Removed hodler address
     */
    event HodlerRemoved(address account);

    /**
     * @dev Token is settled on hodlers addresses
     * @param token address The token address
     * @param amount uint256 Settled amount
     */
    event TokenSettled(address token, uint256 amount);

    /**
     * @dev Adds new hodler to book
     * @param account address Hodler's address
     * @param joinTimestamp uint32 Hodler's joining timestamp
     */
    function addHodler(address account, uint32 joinTimestamp)
        public
        onlyOwner
        onlyValidAddress(account)
        onlyNotExisting(account)
        onlyPast(joinTimestamp)
    {
        hodlers.add(account, joinTimestamp);
        HodlerAdded(account, joinTimestamp);
    }

    /**
     * @dev Removes existing hodler from book
     * @param account address Hodler's address whose should be removed
     */
    function removeHodler(address account)
        public
        onlyOwner
        onlyValidAddress(account)
        onlyExisting(account)
    {
        hodlers.remove(account);
        HodlerRemoved(account);
    }

    /**
     * @dev Settles given token on hodlers addresses
     * @param token BasicToken The token to settle
     */
    function settleToken(BasicToken token)
        public
        onlyOwner
        onlyHodlersExist
        onlySufficientAmount(token)
    {
        uint256 tokenAmount = token.balanceOf(this);

        uint256[] memory tokenShares = calculateShares(tokenAmount);

        for (uint i = 0; i < hodlers.entries.length; i++) {
            token.transfer(hodlers.entries[i].account, tokenShares[i]);
        }

        TokenSettled(token, tokenAmount);
    }

    /**
     * @dev Calculates proportional share in given amount
     * @param amount uint256 Amount to share between hodlers
     * @return tokenShares uint256[] Calculated shares
     */
    function calculateShares(uint256 amount)
        public
        view
        returns (uint256[])
    {
        uint256[] memory temp = new uint256[](hodlers.entries.length);

        uint256 sum = 0;
        for (uint256 i = 0; i < temp.length; i++) {
            // solhint-disable-next-line not-rely-on-time
            temp[i] = now.sub(hodlers.entries[i].joinTimestamp);
            sum = sum.add(temp[i]);
        }

        for (i = 0; i < temp.length; i++) {
            temp[i] = amount.mul(temp[i]).div(sum);
        }

        return temp;
    }

    /**
     * @dev Returns hodlers addresses with joining timestamps
     * @return address[] Addresses of hodlers
     * @return uint32[] joining timestamps. Related by index with addresses
     */
    function getHodlers()
        public
        view
        returns (address[], uint32[])
    {
        address[] memory hodlersAddresses = new address[](hodlers.entries.length);
        uint32[] memory hodlersTimestamps = new uint32[](hodlers.entries.length);

        for (uint256 i = 0; i < hodlers.entries.length; i++) {
            hodlersAddresses[i] = hodlers.entries[i].account;
            hodlersTimestamps[i] = hodlers.entries[i].joinTimestamp;
        }

        return (hodlersAddresses, hodlersTimestamps);
    }

    /**
     * @param account address Hodler address
     * @return bool whether account is registered as holder
     */
    function isHodler(address account)
        public
        view
        returns (bool)
    {
        return hodlers.contains(account);
    }
}