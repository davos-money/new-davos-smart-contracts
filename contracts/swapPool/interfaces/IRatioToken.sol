// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRatioToken is IERC20 {
  function ratio() external view returns (uint256);
}
