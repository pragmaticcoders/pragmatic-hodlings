pragma solidity 0.4.19;


/**
 * @title Holder
 * @dev Holder contract allows to..
 */
contract Holder {
    
    uint256 public exampleAttribute;

    modifier onlyExampleCondition(uint256 value) {
        require(value > 10);
        _;
    }

    event ExampleAttributeChanged(uint256 newValue);

    function Holder() public {
        exampleAttribute = 10;
    }

    function exampleFunction(uint256 newValue)
        public
        onlyExampleCondition(newValue)
    {
        exampleAttribute = newValue;

        ExampleAttributeChanged(newValue);
    }
}
