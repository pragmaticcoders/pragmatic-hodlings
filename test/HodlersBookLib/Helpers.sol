pragma solidity 0.4.19;

import "truffle/Assert.sol";
import "../../contracts/MembersBookLib.sol";


library Helpers {

    using MembersBookLib for MembersBookLib.MembersBook;

    function deepEqual(
        MembersBookLib.MembersBook storage book,
        address[2] memory expectedAddresses,
        uint32[2] memory expectedTimestamps
    )
        internal
    {
        address[] memory addresses = new address[](2);
        addresses[0] = expectedAddresses[0];
        addresses[1] = expectedAddresses[1];

        uint32[] memory timestamps = new uint32[](2);
        timestamps[0] = expectedTimestamps[0];
        timestamps[1] = expectedTimestamps[1];

        deepEqual(book, addresses, timestamps);
    }

    function deepEqual(
        MembersBookLib.MembersBook storage book,
        address[3] memory expectedAddresses,
        uint32[3] memory expectedTimestamps
    )
        internal
    {
        address[] memory addresses = new address[](3);
        addresses[0] = expectedAddresses[0];
        addresses[1] = expectedAddresses[1];
        addresses[2] = expectedAddresses[2];

        uint32[] memory timestamps = new uint32[](3);
        timestamps[0] = expectedTimestamps[0];
        timestamps[1] = expectedTimestamps[1];
        timestamps[2] = expectedTimestamps[2];

        deepEqual(book, addresses, timestamps);
    }

    function deepEqual(
        MembersBookLib.MembersBook storage book,
        address[] memory expectedAddresses,
        uint32[] memory expectedTimestamps
    )
        private
    {
        Assert.equal(
            book.entries.length,
            expectedAddresses.length,
            "Length should be equal"
        );
        for (uint256 i = 0; i < book.entries.length; i++) {
            Assert.equal(
                book.entries[i].account,
                expectedAddresses[i],
                "Address should be equal"
            );
            Assert.equal(
                uint(book.entries[i].joinDate),
                uint(expectedTimestamps[i]),
                "Timestamp should be equal"
            );
        }

    }
}
