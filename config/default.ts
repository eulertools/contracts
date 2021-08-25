import dotenv from 'dotenv';

dotenv.config();

export const config = () => ({

    network: {
      rpc: process.env.NETWORK_RPC
    },

    wallet: {
      address: process.env.WALLET_ADDRESS,
      privateKey: process.env.WALLET_PRIVATE_KEY
    },
    
    token: {
      address: process.env.EULER_TOKEN_ADDRESS,
    },

    staking: {
      address: process.env.EULER_STAKING_ADDRESS,
      min: process.env.EULER_STAKING_MIN_DEPOSIT,
      max: process.env.EULER_STAKING_MAX_DEPOSIT,
      tokenPerBlock: process.env.EULER_STAKING_TOKEN_PER_BLOCK
    }
})
