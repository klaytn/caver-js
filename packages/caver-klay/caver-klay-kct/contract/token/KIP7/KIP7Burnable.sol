pragma solidity ^0.5.0;

import "./KIP7.sol";
import "../../introspection/KIP13.sol";

/**
 * @dev Extension of `KIP7` that allows token holders to destroy both their own
 * tokens and those that they have an allowance for, in a way that can be
 * recognized off-chain (via event analysis).
 *
 * See http://kips.klaytn.com/KIPs/kip-7-fungible_token
 */
contract KIP7Burnable is KIP13, KIP7 {
    /*
     *     bytes4(keccak256('burn(uint256)')) == 0x42966c68
     *     bytes4(keccak256('burnFrom(address,uint256)')) == 0x79cc6790
     *
     *     => 0x42966c68 ^ 0x79cc6790 == 0x3b5a0bf8
     */
    bytes4 private constant _INTERFACE_ID_KIP7BURNABLE = 0x3b5a0bf8;

    constructor () public {
        // register the supported interfaces to conform to KIP17 via KIP13
        _registerInterface(_INTERFACE_ID_KIP7BURNABLE);
    }
    
    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See `KIP7._burn`.
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev See `KIP7._burnFrom`.
     */
    function burnFrom(address account, uint256 amount) public {
        _burnFrom(account, amount);
    }
}
