pragma solidity ^0.5.0;

import "./KIP7.sol";

/**
 * @dev Extension of `KIP7` that allows token holders to destroy both their own
 * tokens and those that they have an allowance for, in a way that can be
 * recognized off-chain (via event analysis).
 */
contract KIP7Burnable is KIP7 {
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
