// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SushiToken is ERC20 {

    address admin = msg.sender;

    constructor() ERC20("SushiBar", "SUSHI") {
        _mint(admin, 1000000000 * (10 ** 18));
    }

    function mint(address _to, uint256 amount) public {
        _mint(_to, amount);
    }
}