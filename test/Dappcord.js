const { expect } = require("chai");
const { ethers } = require("hardhat");


const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappcord", function () {
  let dappCord;
  const NAME = "Dappcord";
  const SYMBOL = "DC";
  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const DappCord = await ethers.getContractFactory(NAME);
    dappCord = await DappCord.deploy(NAME, SYMBOL);
    //create channel
    const transaction = await dappCord.connect(deployer).createChannel("general", tokens(1));
    await transaction.wait();
  })
  describe('Deployment', () => {
    it("Gets the name", async () => {
      let result = await dappCord.name();
      expect(result).to.equal(NAME);
    })
    it("Gets the symbol", async () => {
      let result = await dappCord.symbol();
      expect(result).to.equal(SYMBOL);
    })
    it("Sets the owner", async () => {
      const result = await dappCord.owner();
      expect(result).to.equal(deployer.address);
    })

  })
  describe("Creating channel", () => {
    it("Return total channels", async () => {
      const result = await dappCord.totalChannels();
      expect(result).to.equal(1);
    })
    it("Return channel attributes", async () => {
      const result = await dappCord.getChannel(1);
      expect(result.id).to.equal(1);
      expect(result.name).to.equal("general");
      expect(result.cost).to.equal(tokens(1));
    })
  })
  describe("Joining channel", () => {
    const id = 1; //channel id
    const amount = ethers.utils.parseUnits("1", 'ether'); //amount to send for minting

    beforeEach(async () => {
      const transaction = await dappCord.connect(user).mint(id, {value: amount});
      await transaction.wait();
    })
    it("Joins the user", async () => {
      const result = await dappCord.hasJoined(id, user.address);
      expect(result).to.equal(true);
    })
    it("Increases total supply", async () => {
      const result = await dappCord.totalSupply();
      expect(result).to.equal(1);
    })
    it("Updated Contract balance", async () => {
      const result = await ethers.provider.getBalance(dappCord.address);
      expect(result).to.equal(amount);
    })
  })
  describe("Withdrawing", () => {
    const id = 1; 
    const amount = ethers.utils.parseUnits("10", 'ether'); 
    let balanceBefore
    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);
      let transaction = await dappCord.connect(user).mint(id, {value: amount});
      await transaction.wait();

      transaction = await dappCord.connect(deployer).withdraw();
      await transaction.wait();
    })
    it("update the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.greaterThan(balanceBefore);
    })
    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappCord.address);
      expect(result).to.equal(0);
    })

  })
})
