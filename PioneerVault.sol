pragma solidity ^0.8.0;

contract PioneerVault {

    mapping(address => uint) public pioneerBalance;

    function deposit(uint amount) public {

        pioneerBalance[msg.sender] += amount;

    }

}
