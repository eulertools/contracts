import Web3 from 'web3';
import contract from "truffle-contract";
import EULER_STAKING_JSON from '../build/contracts/EulerStaking.json';
import IERC20_JSON from '../build/contracts/IERC20.json';

import { config } from '../config/default';

const MAX_APPROVE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const conf = config();

const web3 = new Web3(conf.network.rpc);

const PID = 0;

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

            const transferContract = contract(IERC20_JSON);
    
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
    }

    public transfer = async (account:string, amount:string) => { 

        const instance = await this.getToken();

        return instance.transfer(this.contractAddress, amount, { from: account })
    }

    public isApprove = async(account:string) => {

        const instance = await this.getToken();

        let allowance;
    
        try {

            allowance = await instance.allowance(account, this.contractAddress);

        } catch(e) { console.log(e) };

        return MAX_APPROVE === (web3.utils.toHex(allowance));
    }

    public approve = async(account:string) => {

        const instance = await this.getToken();

        return instance.approve(this.contractAddress, MAX_APPROVE,{ from: account });
    }

    public deposit = async (account:string, amount:string) => { 

        const instance = await this.getInstance();

        return instance.deposit(PID,amount, { from: account });
    }

    public withdraw = async (account:string, amount:string) => { 

        const instance = await this.getInstance();

        return instance.withdraw(PID, amount, { from: account });
    }

    public withdrawAll = async (account:string) => { 

        const instance = await this.getInstance();

        return instance.withdrawAll(PID, { from: account });
    }

    public claim = async (account:string) => { 

        const instance = await this.getInstance();

        return instance.claim(PID, { from: account });
    }

    public pendingRewards = async (account:string) => { 

        const instance = await this.getInstance();

        return instance.pendingRewards(PID, account);
    }

    public userInfo = async (account:string) => { 

        const instance = await this.getInstance();

        const { amount , rewardDebt, pendingRewards ,lastClaim } = (await instance.userInfo(PID, account));

        return {
            'amount': amount.toString(),
            'rewardDebt': rewardDebt.toString(),
            'pendingRewards': pendingRewards.toString(),
            'lastClaim': lastClaim.toString()
        };
    }
}

export default EulerStakingSDK;