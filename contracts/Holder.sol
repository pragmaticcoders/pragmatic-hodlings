pragma solidity 0.4.19;

import { Ownable } from "zeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "zeppelin-solidity/contracts/math/SafeMath.sol";
import { BasicToken } from "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";


/**
 * @title Proportionally distribute contract's tokens to each registered hodler
 * @dev Proportion is calculated based on joined timestamp
 * @dev Group of hodlers and settlements are managed by contract owner
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
contract PragmaticHodlings is Ownable {

    using SafeMath for uint256;

    uint256 private constant DAY_IN_SECONDS = 86400;
    uint256 constant PROPORTION_DENOMINATOR = 1000;

    struct Hodler {
        address account;
        uint32 joinTimestamp;
    }

    Hodler[] private hodlers;

    modifier onlyIfHodlersExist {
        require(hodlers.length != 0);
        _;
    }

    modifier onlyIfHodler(address account) {
        require(isHodler(account) == true);
        _;
    }

    modifier onlyNotHodler(address account) {
        require(isHodler(account) == false);
        _;
    }

    modifier onlySufficientAmount(BasicToken token) {
        require(token.balanceOf(this) > 0);
        _;
    }

    /**
     * @dev Token is settled on hodlers addresses
     * @param token address The token address
     * @param amount uint256 Settled amount
     */
    event TokenSettled(address token, uint256 amount);

    /**
    * @dev New hodler registered
    * @param account address The hodler address
    * @param joinTimestamp uint32 Timestamp, when hodler joined
    */
    event HodlerRegistered(address account, uint32 joinTimestamp);

    /**
     * @dev Hodler fired
     * @param account address Fired hodler address
     */
    event HodlerFired(address account);

    /**
    * @dev Register new hodler
    * @param account address The hodler address
    * @param joinTimestamp uint32 Timestamp, when hodler joined
    */
    function registerHodler(address account, uint32 joinTimestamp)
        public
        onlyOwner
        onlyNotHodler(account)
    {
        hodlers.push(
            Hodler({
                account: account,
                joinTimestamp: joinTimestamp
            }));

        HodlerRegistered(account, joinTimestamp);
    }

    /**
    * @dev Fire hodler
    * @param account address The hodler address
    */
    function fireHodler(address account)
        public
        onlyOwner
        onlyIfHodler(account)
    {
        uint256 firedIndex = getHodlerIndex(account);

        delete hodlers[firedIndex];
        hodlers[firedIndex] = hodlers[hodlers.length - 1];
        hodlers.length--;

        HodlerFired(account);
    }

    /**
     * @dev Settles given token on hodlers addresses
     * @param token BasicToken The token to settle
     */
    function settleToken(BasicToken token)
        public
        onlyOwner
        onlyIfHodlersExist
        onlySufficientAmount(token)
    {
        uint256 tokenAmount = token.balanceOf(this);

        uint256[] memory tokenShares = calculateShares(tokenAmount);

        for (uint i = 0; i < hodlers.length; i++) {
            token.transfer(hodlers[i].account, tokenShares[i]);
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
        uint256[] memory tokenShares = new uint256[](hodlers.length);

        uint256[] memory proportions = calculateProportions();

        for (uint256 i = 0; i < employees.length; i++) {
            tokenShares[i] = amount.mul(proportions[i]).div(PROPORTION_DENOMINATOR);
        }

        return tokenShares;
    }

    /**
     * @dev Returns hodlers and their timestamps
     * @return address[] Addresses of hodlers
     * @return uint32[] join timestamps. Relating by index with addresses
     */
    function getHodlers() public view returns (address[], uint32[]) {
        address[] memory hodlersAddresses = new address[](hodlers.length);
        uint32[] memory hodlersTimestamps = new uint32[](hodlers.length);

        for (uint256 i = 0; i < hodlers.length; i++) {
            hodlersAddresses[i] = hodlers[i].account;
            hodlersTimestamps[i] = hodlers[i].joinTimestamp;
        }

        return (hodlersAddresses, hodlersTimestamps);
    }

    /**
    * @param account address Hodler address
    * @return bool whether account is registered as holder
    */
    function isHodler(address account) public view returns (bool) {
        for (uint256 i = 0; i < hodlers.length; i++) {
            if (hodlers[i].account == account) {
                return true;
            }
        }
    }

    function getHodlerIndex(address account)
        internal
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < hodlers.length; i++) {
            if (hodlers[i].account == account) {
                return i;
            }
        }
        assert(false);
    }

    function calculateProportions()
        internal
        view
        returns (uint256[])
    {
        uint256[] memory proportions = new uint256[](hodlers.length);

        uint minSeniority = 1;
        uint daysSum = 0;
        for (uint i = 0; i < proportions.length; i++) {
            // solhint-disable-next-line not-rely-on-time
            uint256 seniority = now.sub(hodlers[i].joinTimestamp);
            uint256 daysSeniority = seniority.div(DAY_IN_SECONDS).add(1);
            proportions[i] = daysSeniority;
            daysSum = daysSum.add(daysSeniority);

            if (daysSeniority < minSeniority || i == 0) {
                minSeniority = daysSeniority;
            }
        }

        uint256 subFactor = minSeniority.sub(1);
        daysSum = daysSum.sub(subFactor.mul(proportions.length));
        for (i = 0; i < proportions.length; i++) {
            proportions[i] = (proportions[i].sub(subFactor)).mul(PROPORTION_DENOMINATOR).div(daysSum);
        }

        return proportions;
    }
}
