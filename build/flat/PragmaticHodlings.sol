pragma solidity 0.4.19;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  /**
  * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}


/**
 * @title MembersBook library
 * @dev Allows to store and manage addresses of members in contract
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
library MembersBookLib {

    /**
     * @dev Represents member with its address and
     * @dev joining to organization timestamp
     */
    struct Member {
        address account;
        uint32 joined;
    }

    /**
     * @dev Represents set of members
     */
    struct MembersBook {
        Member[] entries;
    }

    /**
     * @dev Adds new member to book
     * @param account address Member's address
     * @param joined uint32 Member's joining timestamp
     */
    function add(
        MembersBook storage self,
        address account,
        uint32 joined
    )
    internal
    returns (bool)
    {
        if (account == address(0) || contains(self, account)) {
            return false;
        }

        self.entries.push(
            Member({
            account: account,
            joined: joined
            }));

        return true;
    }

    /**
     * @dev Removes existing member from book
     * @param account address Member's address whose should be removed
     */
    function remove(
        MembersBook storage self,
        address account
    )
    internal
    returns (bool)
    {
        if (!contains(self, account)) {
            return false;
        } else {
            uint256 entryIndex = index(self, account);
            if (entryIndex < self.entries.length - 1) {
                self.entries[entryIndex] = self.entries[self.entries.length - 1];
            }

            self.entries.length--;
        }

        return true;
    }

    /**
     * @dev Checks if member address exists in book
     * @param account address Address to check
     * @return bool Address existence indicator
     */
    function contains(
        MembersBook storage self,
        address account
    )
    internal
    view
    returns (bool)
    {
        for (uint256 i = 0; i < self.entries.length; i++) {
            if (self.entries[i].account == account) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Returns member index in book or reverts if doesn't exists
     * @param account address Address to check
     * @return uint256 Address index
     */
    function index(
        MembersBook storage self,
        address account
    )
    private
    view
    returns (uint256)
    {
        for (uint256 i = 0; i < self.entries.length; i++) {
            if (self.entries[i].account == account) {
                return i;
            }
        }
        assert(false);
    }
}


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
 * @dev Proportion is calculated based on joined timestamp
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

    modifier onlyPast(uint32 timestamp) {
        // solhint-disable-next-line not-rely-on-time
        require(now > timestamp);
        _;
    }

    /**
    * @dev New hodler has been added to book
    * @param account address Hodler's address
    * @param joined uint32 Hodler's joining timestamp
    */
    event HodlerAdded(address account, uint32 joined);

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
     * @param joined uint32 Hodler's joining timestamp
     */
    function addHodler(address account, uint32 joined)
        public
        onlyOwner
        onlyValidAddress(account)
        onlyNotExisting(account)
        onlyPast(joined)
    {
        hodlers.add(account, joined);
        HodlerAdded(account, joined);
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
            temp[i] = now.sub(hodlers.entries[i].joined);
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
            hodlersTimestamps[i] = hodlers.entries[i].joined;
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
