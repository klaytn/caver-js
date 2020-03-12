pragma solidity ^0.5.0;

import "./IKIP7.sol";
import "../../introspection/KIP13.sol";

/**
 * @dev Optional functions from the KIP7 standard.
 * See http://kips.klaytn.com/KIPs/kip-7-fungible_token
 */
contract KIP7Metadata is KIP13, IKIP7 {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    /*
     *     bytes4(keccak256('name()')) == 0x06fdde03
     *     bytes4(keccak256('symbol()')) == 0x95d89b41
     *     bytes4(keccak256('decimals()')) == 0x313ce567
     *
     *     => 0x06fdde03 ^ 0x95d89b41 ^ 0x313ce567 == 0xa219a025
     */
    bytes4 private constant _INTERFACE_ID_KIP7_METADATA = 0xa219a025;

    /**
     * @dev Sets the values for `name`, `symbol`, and `decimals`. All three of
     * these values are immutable: they can only be set once during
     * construction.
     */
    constructor (string memory name, string memory symbol, uint8 decimals) public {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;

        // register the supported interfaces to conform to KIP7 via KIP13
        _registerInterface(_INTERFACE_ID_KIP7_METADATA);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei.
     *
     * > Note that this information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * `IKIP7.balanceOf` and `IKIP7.transfer`.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }
}
