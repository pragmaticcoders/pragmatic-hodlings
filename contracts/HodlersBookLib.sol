pragma solidity 0.4.19;


/**
 * @title HodlersBook library
 * @dev Allows to store and manage addresses of hodlers in contract
 * @author Wojciech Harzowski (https://github.com/harzo)
 * @author Dominik Kroliczek (https://github.com/kruligh)
 */
library HodlersBookLib {

    /**
     * @dev Represents hodler with its address and
     * @dev joining to organization timestamp
     */
    struct Hodler {
        address account;
        uint32 joinTimestamp;
    }

    /**
     * @dev Represents hodler with its address and
     * @dev and joining to organization timestamp
     */
    struct HodlersBook {
        Hodler[] entries;
    }

    /**
     * @dev Adds new hodler to book
     * @param account address Hodler's address
     * @param joinTimestamp uint32 Hodler's joining timestamp
     */
    function add(
        HodlersBook storage self,
        address account,
        uint32 joinTimestamp
    )
        internal
        returns (bool)
    {
        if (contains(self, account)) {
            return false;
        }

        self.entries.push(
            Hodler({
                account: account,
                joinTimestamp: joinTimestamp
            }));

        return true;
    }

    /**
     * @dev Removes existing hodler from book
     * @param account address Hodler's address whose should be removed
     */
    function remove(
        HodlersBook storage self,
        address account
    )
        internal
        returns (bool)
    {
        if (!contains(self, account)) { // not existing
            return false;
        } else {
            uint256 entryIndex = index(self, account);
            // first or in the middle
            if (entryIndex < self.entries.length - 1) {
                self.entries[entryIndex] = self.entries[self.entries.length - 1];
            }

            self.entries.length--;
        }

        return true;
    }

    /**
     * @dev Clears out book
     */
    function clear(HodlersBook storage self) internal {
        delete self.entries;
    }

    /**
     * @dev Checks if hodler address exists in book
     * @param account address Address to check
     * @return Address existence indicator
     */
    function contains(
        HodlersBook storage self,
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
     * @dev Returns hodler index in book
     * @param account address Address to check
     * @return uint256 Address index
     */
    function index(
        HodlersBook storage self,
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
