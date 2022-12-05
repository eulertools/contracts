// SPDX-FileCopyrightText: 2022 Euler Tools Solutions, SL
//
// SPDX-License-Identifier: MIT

import HDWalletProvider  from 'truffle-hdwallet-provider';

import { config } from "../config/default";
import EulerStakingSDK from '../src/EulerStakingSDK';

const conf = config();

function getWeb3Provider() {

    return new HDWalletProvider(conf.wallet.privateKey,conf.network.rpc);
}

const init = async () => {

    const provider = getWeb3Provider();

    const sdk = new EulerStakingSDK(provider, conf.staking.address,conf.token.address);

    console.log(await sdk.userInfo(conf.wallet.address));

    console.log(await sdk.userInfoByPosition(0));

    console.log(await sdk.totalUsers());

    provider.engine.stop();
}

init();
