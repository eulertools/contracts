// SPDX-FileCopyrightText: 2022 Euler Tools Solutions, SL
//
// SPDX-License-Identifier: MIT

import Web3 from 'web3';
import HDWalletProvider  from 'truffle-hdwallet-provider';

import { config } from "../config/default";
import EulerStakingSDK from './EulerStakingSDK';

const conf = config();

const web3 = new Web3(conf.network.rpc);

function getWeb3Provider() {

    return new HDWalletProvider(conf.wallet.privateKey,conf.network.rpc);
}

const init = async () => {

    const provider = getWeb3Provider();

    const sdk = new EulerStakingSDK(provider, conf.staking.address,conf.token.address);

    const amount = web3.utils.toWei('10000','ether');

    await sdk.approveAndDeposit(conf.wallet.address, amount)
    .then((tx) => {
        if(tx.approve) console.log(`Tx Approve: ${tx.approve.tx}`)
        if(tx.deposit) console.log(`Tx Deposit: ${tx.deposit.tx}`)
    })
    .catch((e) => console.log(e.message));

    provider.engine.stop();
}

init();
