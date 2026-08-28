// SPDX-FileCopyrightText: 2022 Euler Tools Solutions, SL
//
// SPDX-License-Identifier: MIT

const Migrations = artifacts.require("Migrations");
const EulerTools = artifacts.require("EulerTools");
const stakingContract = artifacts.require('EulerStaking');

module.exports = function (deployer) {
  deployer.deploy(Migrations);
//   deployer.deploy(EulerTools);
  deployer.deploy(stakingContract);
};
