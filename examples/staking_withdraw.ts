// SPDX-FileCopyrightText: 2022 Euler Tools Solutions, SL
//
// SPDX-License-Identifier: MIT

import Web3 from 'web3';
import HDWalletProvider  from 'truffle-hdwallet-provider';

import { config } from "../config/default";
import EulerStakingSDK from './src/EulerStakingSDK';

const conf = config();

const web3 = new Web3(conf.network.rpc);

function getWeb3Provider() {
    
    return new HDWalletProvider(conf.wallet.privateKey,conf.network.rpc);
}

const init = async () => {

    const provider = getWeb3Provider();

    const sdk = new EulerStakingSDK(provider, conf.staking.address,conf.token.address);

    await sdk.withdraw(conf.wallet.address, web3.utils.toWei('1000','ether'))
    .then((tx) => console.log(`Tx Withdraw: ${tx.tx}`))
    .catch((e) => console.log(e.message));

    await sdk.withdrawAll(conf.wallet.address)
    .then((tx) => console.log(`Tx Withdraw: ${tx.tx}`))
    .catch((e) => console.log(e.message));

    provider.engine.stop();
}

init();
