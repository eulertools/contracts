import Web3 from 'web3';
import HDWalletProvider  from 'truffle-hdwallet-provider';

import { config } from "../config/default";
import EulerStakingSDK from '../src/EulerStakingSDK';

const conf = config();

const web3 = new Web3(conf.network.rpc);

function getWeb3Provider() {
    
    return new HDWalletProvider(conf.wallet.privateKey,conf.network.rpc);
}

const init = async () => {

    const provider = getWeb3Provider();

    const sdk = new EulerStakingSDK(provider, conf.staking.address,conf.token.address);

    await sdk.claim(conf.wallet.address)
    .then((tx) => console.log(`Tx Claim: ${tx.tx}`))
    .catch((e) => console.log(e.message));

    provider.engine.stop();
}

init();
