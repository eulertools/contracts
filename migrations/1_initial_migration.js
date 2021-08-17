const Migrations = artifacts.require("Migrations");
const stakingContract = artifacts.require('EulerStaking');

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(stakingContract);
};
