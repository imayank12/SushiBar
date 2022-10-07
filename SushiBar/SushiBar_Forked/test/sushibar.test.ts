import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("SushiBarStake", function () {

  let admin: { address: any; }, token: Contract, contract: Contract;

  beforeEach(async function () {
    // getting admin address
    [admin] = await ethers.getSigners();

    // Deploying Token token 
    const SushiToken = await ethers.getContractFactory("SushiToken");
    token = await SushiToken.deploy();
    await token.deployed();

    // deploying staking contract
    const SushiBar = await ethers.getContractFactory("SushiBar");
    contract = await SushiBar.deploy(token.address);
    await contract.deployed();

  });

  describe("Token Stake", function () {
    it("Should be able to stake", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

    })

    it("Should not be able to unStake before 2 days", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      //unStake within 2 days
      await expect(contract.leave())
        .to.be.revertedWith('Amount is locked');

    })

    it("Should only unstake 25% between 2-4days", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      const days = 3 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [days]);

      //unStake after 3 days
      const unstake = await contract.leave();
      unstake.wait();
      const stakedAmount = await contract.staked(admin.address)
      const amountLeft = (100000000000000000000 - (100000000000000000000 / 100 * 25))
      expect(stakedAmount).to.be.equal(ethers.BigNumber.from(amountLeft.toString()));

    })

    it("Should only unstake 25% between 4-6days", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      const days = 5 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [days]);

      //unStake after 5 days
      const unstake = await contract.leave();
      unstake.wait();
      const stakedAmount = await contract.staked(admin.address)
      const amountLeft = (100000000000000000000 - (100000000000000000000 / 100 * 50))
      expect(stakedAmount).to.be.equal(ethers.BigNumber.from(amountLeft.toString()));

    })

    it("Should only unstake 75% between 6-8days", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      const days = 7 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [days]);

      //unStake after 7 days
      const unstake = await contract.leave();
      unstake.wait();
      const stakedAmount = await contract.staked(admin.address)
      const amountLeft = (100000000000000000000 - (100000000000000000000 / 100 * 75))
      expect(stakedAmount).to.be.equal(ethers.BigNumber.from(amountLeft.toString()));

    })

    it("should unstake 100% token after 8days", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      const days = 9 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [days]);

      //unStake after 8 days
      const unstake = await contract.leave();
      unstake.wait();
      const stakedAmount = await contract.staked(admin.address)
      expect(stakedAmount).to.be.equal(0);
    })

    it(" pool prize", async function () {
      const amount = ethers.BigNumber.from("100000000000000000000")

      // Approving token spend
      const approveToken = await token.approve(contract.address, amount)
      await approveToken.wait()
      expect(await token.allowance(admin.address, contract.address)).to.equal(amount);

      // Stake token
      const stakeToken = await contract.enter(amount)
      await stakeToken.wait()
      const amountStaked = await contract.staked(admin.address);
      expect(await amountStaked).to.equal(amount);

      const days = 9 * 24 * 60 * 60;
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [days]);

      const unstake = await contract.leave();
      unstake.wait();
      const stakedAmount = await contract.staked(admin.address)
      expect(stakedAmount).to.be.equal(0);


      const releaseMyReward = await contract.releaseMyReward();
      releaseMyReward.wait();

    })

  })
});