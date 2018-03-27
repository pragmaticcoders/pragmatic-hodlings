pragma solidity 0.4.19;

import "truffle/Assert.sol";
import { MembersBookLib } from "../../contracts/MembersBookLib.sol";
import { Helpers } from "./Helpers.sol";


contract TestMembersBookLib {

    using MembersBookLib for MembersBookLib.MembersBook;
    using Helpers for MembersBookLib.MembersBook;

    address private constant ZERO_ADDRESS = address(0x0);
    address private constant ADDRESS_1 = address(0xdeadbeef);
    address private constant ADDRESS_2 = address(0xcafebabe);
    address private constant ADDRESS_3 = address(0xfee1dead);
    uint32 private constant TIMESTAMP_1 = 1000;
    uint32 private constant TIMESTAMP_2 = 2000;
    uint32 private constant TIMESTAMP_3 = 3000;

    MembersBookLib.MembersBook private book;

    function beforeEach() public {
        delete book;
    }

    function testAdd() public {
        addHodlers();

        book.deepEqual(
            [ADDRESS_1, ADDRESS_2, ADDRESS_3],
            [TIMESTAMP_1, TIMESTAMP_2, TIMESTAMP_3]
        );
    }

    function testAddDuplicate() public {
        addHodlers();

        bool added = book.add(ADDRESS_2, TIMESTAMP_2);
        Assert.isFalse(added, "Should not add");

        book.deepEqual(
            [ADDRESS_1, ADDRESS_2, ADDRESS_3],
            [TIMESTAMP_1, TIMESTAMP_2, TIMESTAMP_3]
        );
    }

    function testAddZeroAddress() public {
        addHodlers();

        bool added = book.add(ZERO_ADDRESS, TIMESTAMP_2);
        Assert.isFalse(added, "Should not add");

        book.deepEqual(
            [ADDRESS_1, ADDRESS_2, ADDRESS_3],
            [TIMESTAMP_1, TIMESTAMP_2, TIMESTAMP_3]
        );
    }

    function testContainsExisting() public {
        addHodlers();

        bool contains = book.contains(ADDRESS_2);
        Assert.isTrue(contains, "Should contain");
    }

    function testContainsNotExisting() public {
        add(ADDRESS_1, TIMESTAMP_1);

        bool contains = book.contains(ADDRESS_2);
        Assert.isFalse(contains, "Should not contain");
    }

    function testRemove() public {
        addHodlers();
        remove(ADDRESS_1);

        book.deepEqual(
            [ADDRESS_3, ADDRESS_2],
            [TIMESTAMP_3, TIMESTAMP_2]
        );
    }

    function testRemoveTheLastOne() public {
        add(ADDRESS_1, TIMESTAMP_1);
        remove(ADDRESS_1);

        Assert.isZero(book.entries.length, "Should be empty");
    }

    function testRemoveNotExisting() public {
        add(ADDRESS_1, TIMESTAMP_1);
        add(ADDRESS_2, TIMESTAMP_2);

        bool removed = book.remove(ADDRESS_3);
        Assert.isFalse(removed, "Should not remove");
    }

    function addHodlers() private {
        add(ADDRESS_1, TIMESTAMP_1);
        add(ADDRESS_2, TIMESTAMP_2);
        add(ADDRESS_3, TIMESTAMP_3);
    }

    function add(address account, uint32 joinDate) private {
        bool added = book.add(account, joinDate);
        Assert.isTrue(added, "Should add");
    }

    function remove(address account) private {
        bool removed = book.remove(account);
        Assert.isTrue(removed, "Should remove");
    }
}
