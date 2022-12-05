// SPDX-FileCopyrightText: 2022 Euler Tools Solutions, SL
//
// SPDX-License-Identifier: MIT

import Web3 from 'web3';
import contract from "truffle-contract";
import EULER_STAKING_JSON from '../build/contracts/EulerStaking.json';
import EULER_JSON from '../build/contracts/EulerTools.json';

import { config } from '../config/default';

const conf = config();

const web3 = new Web3(conf.network.rpc);

class EulerStakingSDK {

    private contractAddress:string;

    private tokenAddress:string;

    private provider:any

    private instance:any;

    private token:any;

    public constructor(provider:any,contractAddress:string,tokenAddress:string) {

        this.provider = provider;

        this.contractAddress = contractAddress;

        this.tokenAddress = tokenAddress;
    }

    private getInstance = async () => {

        if(!this.instance) {

            const transferContract = contract(EULER_STAKING_JSON);

            transferContract.setProvider(this.provider);

            this.instance = await transferContract.at(this.contractAddress)
        }

        return this.instance;
    }

    private getToken = async () => {

        if(!this.token) {

            const transferContract = contract(EULER_JSON);

            transferContract.setProvider(this.provider);

            this.token = await transferContract.at(this.tokenAddress);;
        }

        return this.token;
    }

    public initStaking = async (account:string,minTokenStaking:string,maxTokenStaking:string) => {

        const instance = await this.getInstance();

        await instance.setEulerToken(this.tokenAddress, { from: account })
        .then((tx) => console.log(`Tx setEulerToken: ${tx.tx}`))
        .catch((e) => console.log(e.message));

        await instance.setMinDepositAmount(web3.utils.toWei(minTokenStaking, 'ether'), { from: account })
        .then((tx) => console.log(`Tx setMinDepositAmount: ${tx.tx}`))
        .catch((e) => console.log(e.message));

        if(maxTokenStaking) {
            await instance.setMaxDepositAmount(web3.utils.toWei(maxTokenStaking, 'ether'), { from: account })
            .then((tx) => console.log(`Tx setMaxDepositAmount: ${tx.tx}`))
            .catch((e) => console.log(e.message));
        }

        const blockNumber = await web3.eth.getBlockNumber();

        await instance.startStaking(blockNumber, { from: account })
        .then((tx) => console.log(`Tx startStaking: ${tx.tx}`))
        .catch((e) => console.log(e.message));

        await this.excludeContractFromFees(account)
        .then((tx) => console.log(`Tx include whitelist: ${tx.tx}`))
        .catch((e) => console.log(e.message));
    }

    public excludeContractFromFees = async (account:string) => {

        const token = await this.getToken();

        return token.excludeAccount(this.contractAddress, { from: account });
    }

    public setLockupDuration = async (account:string, lockupDuration:string) => {

        const instance = await this.getInstance();

        return instance.setLockupDuration(lockupDuration, { from: account });
    }

    public transfer = async (account:string, amount:string) => {

        const instance = await this.getToken();

        return instance.transfer(this.contractAddress, amount, { from: account })
    }

    public isAllowed = async(account:string, amount:string) => {

        const instance = await this.getToken();

        let allowanceBN;

        try {

            allowanceBN = await instance.allowance(account, this.contractAddress);

        } catch(e) { console.log(e) };

        return allowanceBN.gte(web3.utils.toBN(amount));
    }

    public approve = async(account:string, amount:string) => {

        const instance = await this.getToken();

        return instance.approve(this.contractAddress, amount, { from: account } );
    }

    public deposit = async (account:string, amount:string) => {

        const instance = await this.getInstance();

        return instance.deposit(amount, { from: account });
    }

    public approveAndDeposit = async(account:string, amount:string) => {

        let txApprove;

        if(!(await this.isAllowed(conf.wallet.address,amount))) {

            await this.approve(conf.wallet.address, amount)
            .then((tx) => txApprove = tx)
            .catch((e) => console.log(e.message));
        }

        return {
            'approve': txApprove,
            'deposit': await this.deposit(conf.wallet.address, amount)
        };
    }

    public withdraw = async (account:string, amount:string) => {

        const instance = await this.getInstance();

        return instance.withdraw(amount, { from: account });
    }

    public withdrawAll = async (account:string) => {

        const instance = await this.getInstance();

        return instance.withdrawAll({ from: account });
    }

    public claim = async (account:string) => {

        const instance = await this.getInstance();

        return instance.claim({ from: account });
    }

    public userInfo = async (account:string) => {

        const instance = await this.getInstance();

        const userInfo = (await instance.getUserInfo(account));

        return this.mappingUserInfo(userInfo);
    }

    public userInfoByPosition = async (position:number) => {

        const instance = await this.getInstance();

        const userInfo = (await instance.getUserInfoByPosition(position));

        return this.mappingUserInfo(userInfo);
    }

    public totalUsers = async () => {

        const instance = await this.getInstance();

        return (await instance.getTotalUsers()).toString();
    }

    private mappingUserInfo = (userInfo:any) => {

        let APR = 0

        if(userInfo.tvl > 0) {

            APR = (userInfo.eulerPerBlock * parseInt(conf.network.blocksPerDay, 10) * 365 * 100) / userInfo.tvl;
        }

        return {
            'amount': web3.utils.fromWei(userInfo.amount.toString()),
            'pendingRewards': web3.utils.fromWei(userInfo.pendingRewards.toString()),
            'withdrawAvaliable': new Date(parseInt(userInfo.withdrawAvaliable.toString(), 10) * 1000),
            'apr' : APR.toFixed(3),
            'tvl' : web3.utils.fromWei(userInfo.tvl),
        };
    }

    public poolInfo = async () => {

        const instance = await this.getInstance();

        const poolInfo = await instance.poolInfo();

        let { lockupDuration } = poolInfo;

        const seconds = lockupDuration % 60;
        lockupDuration = (lockupDuration - seconds) / 60;

        const minutes = lockupDuration % 60;
        lockupDuration = (lockupDuration - minutes) / 60;

        const hours = lockupDuration % 24;
        lockupDuration = (lockupDuration - hours) / 24;

        const days = lockupDuration ;

        return {
            'lastRewardBlock': poolInfo.lastRewardBlock.toString(),
            'accEulerPerShare': web3.utils.fromWei(poolInfo.accEulerPerShare.toString()),
            'tvl': web3.utils.fromWei(poolInfo.depositedAmount.toString()),
            'rewardsAmount': web3.utils.fromWei(poolInfo.rewardsAmount.toString()),
            'lockupDuration': { days, hours, minutes, seconds }
        };
    }
}

export default EulerStakingSDK;
