pragma solidity 0.4.24;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";
import { MembersBookLib } from "./MembersBookLib.sol";


/**
 * @title Token interface compatible with Pragmatic Hodlings
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract TransferableToken {
    function transfer(address to, uint256 amount) public;
    function balanceOf(address who) public view returns (uint256);
}


/**
 * @title Proportionally distribute contract's tokens to each registered hodler
 * @dev Proportion is calculated based on join date timestamp
 * @dev Group of hodlers and settlements are managed by contract owner
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract PragmaticHodlings is Ownable {

    using SafeMath for uint256;
    using MembersBookLib for MembersBookLib.MembersBook;

    MembersBookLib.MembersBook private hodlers;

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

    modifier onlySufficientAmount(TransferableToken token) {
        require(token.balanceOf(this) > 0);
        _;
    }

    modifier onlyPast(uint64 timestamp) {
        // solhint-disable not-rely-on-time
        // solium-disable-next-line security/no-block-members
        require(now > timestamp);
        _;
    }

    /**
    * @dev New hodler has been added to book
    * @param account address Hodler's address
    * @param joinDate uint64 Hodler's joining timestamp
    */
    event HodlerAdded(address account, uint64 joinDate);

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
     * @param joinDate uint64 Hodler's joining timestamp
     */
    function addHodler(address account, uint64 joinDate)
        public
        onlyOwner
        onlyValidAddress(account)
        onlyNotExisting(account)
        onlyPast(joinDate)
    {
        hodlers.add(account, joinDate);
        emit HodlerAdded(account, joinDate);
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
        emit HodlerRemoved(account);
    }

    /**
     * @dev Settles given token on hodlers addresses
     * @param token BasicToken The token to settle
     */
    function settleToken(TransferableToken token)
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

        emit TokenSettled(token, tokenAmount);
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
            // solium-disable-next-line security/no-block-members
            temp[i] = now.sub(hodlers.entries[i].joinDate);
            sum = sum.add(temp[i]);
        }

        uint256 sharesSum = 0;
        for (i = 0; i < temp.length; i++) {
            temp[i] = amount.mul(temp[i]).div(sum);
            sharesSum += temp[i];
        }

        if (amount > sharesSum) { // undivided rest of token
            temp[0] = temp[0].add(amount.sub(sharesSum));
        }

        return temp;
    }

    /**
     * @dev Returns hodlers addresses with joining timestamps
     * @return address[] Addresses of hodlers
     * @return uint64[] joining timestamps. Related by index with addresses
     */
    function getHodlers()
        public
        view
        returns (address[], uint64[])
    {
        address[] memory hodlersAddresses = new address[](hodlers.entries.length);
        uint64[] memory hodlersTimestamps = new uint64[](hodlers.entries.length);

        for (uint256 i = 0; i < hodlers.entries.length; i++) {
            hodlersAddresses[i] = hodlers.entries[i].account;
            hodlersTimestamps[i] = hodlers.entries[i].joinDate;
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