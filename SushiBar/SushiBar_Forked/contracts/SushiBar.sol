// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// SushiBar is the coolest bar in town. You come in with some Sushi, and leave with more! The longer you stay, the more Sushi you get.
//
// This contract handles swapping to and from xSushi, SushiSwap's staking token.
contract SushiBar is ERC20("SushiBar", "xSUSHI") {
    using SafeMath for uint256;
    IERC20 public sushi;

    // Define the Sushi token contract
    constructor(IERC20 _sushi) {
        sushi = _sushi;
    }

    struct stakedData {
        uint256 timestacked;
        uint256 amountStaked;
        address owner;
    }
    mapping(address => stakedData) public data;

    struct rewardPoolData {
        uint256 amount;
        address referTo;
    }
    mapping(address => rewardPoolData) public poolData;

    // Enter the bar. Pay some SUSHIs. Earn some shares.
    // Locks Sushi and mints xSushi
    function enter(uint256 _amount) public {
        // Gets the amount of Sushi locked in the contract
        uint256 totalSushi = sushi.balanceOf(address(this));
        // Gets the amount of xSushi in existence
        uint256 totalShares = totalSupply();
        // If no xSushi exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalSushi == 0) {
            _mint(msg.sender, _amount);
        }
        // Calculate and mint the amount of xSushi the Sushi is worth. The ratio will change overtime, as xSushi is burned/minted and Sushi deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalSushi);
            _mint(msg.sender, what);
        }
        // Lock the Sushi in the contract
        sushi.transferFrom(msg.sender, address(this), _amount);
        data[msg.sender] = stakedData(block.timestamp, _amount, msg.sender);
        poolData[msg.sender].referTo = msg.sender;
    }

    function leave() public {
        require(
            data[msg.sender].owner != address(0),
            "Not authorised to leave"
        );
        require(data[msg.sender].amountStaked != 0, "No Amount Staked");

        uint256 userSakedTime = data[msg.sender].timestacked;
        uint256 timeNow = block.timestamp;
        uint256 day_s = checkForTime(userSakedTime, timeNow);
        uint256 stakedAmountRecieved = checkForStaked(day_s);

        require(
            stakedAmountRecieved > 0,
            "Amount is locked"
        );
        uint256 totalAmountStaked = data[msg.sender].amountStaked;
        uint256 canUnstake = totalAmountStaked.div(100).mul(
            stakedAmountRecieved
        );
        uint256 tax = totalAmountStaked - canUnstake;
        
        if (day_s > 8){
            // offering extra pool price only for user who completed the full period
            poolData[msg.sender].amount = data[msg.sender].amountStaked / 2;
        }else{
            poolData[msg.sender].amount = poolData[msg.sender].amount + tax;
        }

        sushi.transfer(msg.sender, canUnstake);
        data[msg.sender].amountStaked = totalAmountStaked - canUnstake;
    }

    function releaseMyReward() public {
        require(poolData[msg.sender].referTo != address(0), "Not authorised");
        require(poolData[msg.sender].amount != 0, "No Amount Left");
        _mint(msg.sender, poolData[msg.sender].amount);
        poolData[msg.sender].amount = 0;
    }

    function checkForTime(uint256 startDate, uint256 endDate)
        internal
        pure
        returns (uint256)
    {
        uint dateDifference = (endDate - startDate) / 60 / 60 / 24;
        return dateDifference;
    }

    function checkForStaked(uint256 _days) public pure returns (uint256) {
        uint256 amount;
        if (_days <= 2)
         {
            amount = 0;
        } else if (_days <= 4)
         {
            amount = 25;
        } else if (_days <= 6) 
        {
            amount = 50;
        } else if (_days <= 8)
         {
            amount = 75;
        } else
         {
            amount = 100;
        }
        return amount;
    }

    function staked(address _owner) public view returns (uint256) {
        return data[_owner].amountStaked;
    }
}
