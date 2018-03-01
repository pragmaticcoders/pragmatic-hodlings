pragma solidity 0.4.19;


/**
 * @title Holder
 * @dev Holder contract allows to
 */
contract Holder {

    struct Employee {
        address addr; // 20 bytes
        uint32 joinTimestamp; // is uint32 enough??
    }

    Employee[] employees;

    function Holder() public {
    }
}
