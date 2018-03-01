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

    event EmployeeRegistered(address addr, uint32 joinTimestamp);
    event EmployeeFired(address addr);

    modifier onlyEmployed(address _addr) {
        require(isEmployed(_addr) == true);
        _;
    }

    modifier onlyNotEmployed(address _addr) {
        require(isEmployed(_addr) == false);
        _;
    }

    function registerEmployee(address _addr, uint32 _joinTimestamp)
        public
        onlyOwner
        onlyNotEmployed(_addr)
    {
        employees.push(
            Employee({
                addr: _addr,
                joinTimestamp: _joinTimestamp
            }));

        EmployeeRegistered(_addr, _joinTimestamp);
    }

    function fireEmployee(address _addr)
        public
        onlyOwner
    {
        uint256 firedIndex = getEmployeeIndex(_addr);
        Employee storage fired = employees[firedIndex];

        delete employees[firedIndex];
        employees[firedIndex] = employees[employees.length - 1];
        employees.length--;

        EmployeeFired(_addr);
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

    function isEmployed(address addr) public view returns (bool) {
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].addr == addr) {
                return true;
            }
        }
    }

    function getEmployeeIndex(address addr)
        internal
        onlyEmployed(addr)
        returns (uint256)
    {
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].addr == addr) {
                return i;
            }
        }
        assert(false);
    }
}
