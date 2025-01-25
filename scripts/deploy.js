const hre = require("hardhat")

const tokens = (n) => {
  return hre.ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Name = "Dappcord"
  const Symbol = "DC"


  const Dappcord = await hre.ethers.getContractFactory("Dappcord");
  const dappcord = await Dappcord.deploy(Name, Symbol);
  await dappcord.deployed();

  console.log("Deployed contract address", dappcord.address);

  // create 3 channels
  const channels= ["general", "intro", "jobs"];
  const costs = [tokens(1), tokens(2), tokens(3)]
  for (let index = 0; index < channels.length; index++) {
    const transaction = await dappcord.connect(deployer).createChannel(channels[index], costs[index]);
    await transaction.wait();
    console.log("channel ", channels[index], " is created")
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});