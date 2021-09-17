import Web3 from 'web3';
import HDWalletProvider  from 'truffle-hdwallet-provider';

import { config } from "../config/default";
import EulerStakingSDK from './EulerStakingSDK';

const conf = config();

function getWeb3Provider() {

    return new HDWalletProvider(conf.wallet.privateKey,conf.network.rpc);
}

const init = async () => {

    const web3 = new Web3(conf.network.rpc);

    const provider = getWeb3Provider();

    const sdk = new EulerStakingSDK(provider, conf.staking.address,conf.token.address);

    provider.engine.stop();
}

init();
