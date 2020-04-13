pragma solidity ^0.5.0;

import "./KIP7.sol";
import "../../access/roles/MinterRole.sol";
import "../../introspection/KIP13.sol";

/**
 * @dev Extension of `KIP7` that adds a set of accounts with the `MinterRole`,
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 *
 * See http://kips.klaytn.com/KIPs/kip-7-fungible_token
 */
contract KIP7Mintable is KIP13, KIP7, MinterRole {
    /*
     *     bytes4(keccak256('mint(address,uint256)')) == 0x40c10f19
     *     bytes4(keccak256('isMinter(address)')) == 0xaa271e1a
     *     bytes4(keccak256('addMinter(address)')) == 0x983b2d56
     *     bytes4(keccak256('renounceMinter()')) == 0x98650275
     *
     *     => 0x40c10f19 ^ 0xaa271e1a ^ 0x983b2d56 ^ 0x98650275 == 0xeab83e20
     */
    bytes4 private constant _INTERFACE_ID_KIP7MINTABLE = 0xeab83e20;

    constructor () public {
        // register the supported interfaces to conform to KIP17 via KIP13
        _registerInterface(_INTERFACE_ID_KIP7MINTABLE);
    }

    /**
     * @dev See `KIP7._mint`.
     *
     * Requirements:
     *
     * - the caller must have the `MinterRole`.
     */
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }
}
