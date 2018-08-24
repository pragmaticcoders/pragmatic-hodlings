pragma solidity 0.4.24;


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
        uint64 joinDate;
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
     * @param joinDate uint64 Member's joining timestamp
     */
    function add(
        MembersBook storage self,
        address account,
        uint64 joinDate
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
                joinDate: joinDate
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
