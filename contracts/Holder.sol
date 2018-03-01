pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Holder
 * @dev Holder contract allows to
 */
contract Holder is Ownable {

    struct Employee {
        address addr; // 20 bytes
        uint32 joinTimestamp; // is uint32 enough??
    }

    Employee[] private employees;

    function Holder() public {
    }

    function registerEmployee(address _addr, uint32 _joinTimestamp) public onlyOwner {
        employees.push(
            Employee({
                addr: _addr,
                joinTimestamp: _joinTimestamp
            }));

        //todo emit event ?
    }

    function getEmployees() public view returns (address[], uint32[]) {
        address[] memory employeesAddresses = new address[](employees.length);
        uint32[] memory employeesTimestamps = new uint32[](employees.length);

        for (uint256 i = 0; i < employees.length; i++) {
            employeesAddresses[i] = employees[i].addr;
            employeesTimestamps[i] = employees[i].joinTimestamp;
        }

        return (employeesAddresses, employeesTimestamps);
    }
}
