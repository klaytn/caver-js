pragma solidity ^0.5.0;

import "./KIP7.sol";
import "../../lifecycle/Pausable.sol";
import "../../introspection/KIP13.sol";

/**
 * @title Pausable token
 * @dev KIP7 modified with pausable transfers.
 */
contract KIP7Pausable is KIP13, KIP7, Pausable {
    /*
     *     bytes4(keccak256('paused()')) == 0x5c975abb
     *     bytes4(keccak256('pause()')) == 0x8456cb59
     *     bytes4(keccak256('unpause()')) == 0x3f4ba83a
     *     bytes4(keccak256('addPauser(address)')) == 0x82dc1ec4
     *     bytes4(keccak256('renouncePauser()')) == 0x6ef8d66d
     *
     *     => 0x5c975abb ^ 0x8456cb59 ^ 0x3f4ba83a ^ 0x82dc1ec4 ^ 0x6ef8d66d == 0x0baef171
     */
    bytes4 private constant _INTERFACE_ID_KIP7PAUSABLE = 0x0baef171;

    constructor () public {
        // register the supported interfaces to conform to KIP17 via KIP13
        _registerInterface(_INTERFACE_ID_KIP7PAUSABLE);
    }

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
