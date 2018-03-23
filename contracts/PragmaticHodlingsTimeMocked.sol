pragma solidity 0.4.19;

import { PragmaticHodlings } from "./PragmaticHodlings.sol";

contract PragmaticHodlingsTimeMocked is PragmaticHodlings{

    uint64 public currentTime;

    function PragmaticHodlingsTimeMocked() public {
    }

    function setNow(uint64 _currentTime)
        public
    {
        currentTime = _currentTime;
    }

    function getNow() private view returns (uint){
        return currentTime;
    }

}
