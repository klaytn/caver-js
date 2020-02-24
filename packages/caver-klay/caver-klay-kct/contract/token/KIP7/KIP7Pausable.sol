pragma solidity ^0.5.0;

import "./KIP7.sol";
import "../../lifecycle/Pausable.sol";

/**
 * @title Pausable token
 * @dev KIP7 modified with pausable transfers.
 */
contract KIP7Pausable is KIP7, Pausable {
    function transfer(address to, uint256 value) public whenNotPaused returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint256 value) public whenNotPaused returns (bool) {
        return super.transferFrom(from, to, value);
    }

    function approve(address spender, uint256 value) public whenNotPaused returns (bool) {
        return super.approve(spender, value);
    }
}
