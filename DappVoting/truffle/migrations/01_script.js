const Voting = artifacts.require("Voting");

module.exports= async (deployer) => {
    deployer.deploy(Voting);
}