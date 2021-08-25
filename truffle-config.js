const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

const privateKey = process.env.WALLET_PRIVATE_KEY;

module.exports = {
  networks: {
    development: {      
      provider: () => new HDWalletProvider(privateKey,"http://localhost:8545"),
      network_id: '5777'
    },
    bsctest: {      
      provider: () => new HDWalletProvider(privateKey,"https://data-seed-prebsc-1-s1.binance.org:8545"),
      network_id: '97',
    },
    bscmain: {      
      provider: () => new HDWalletProvider(privateKey,"https://bsc-dataseed1.defibit.io"),
      network_id: '56',
    }
  },
  compilers: {
    solc: {
      version:"0.8.7"
    }
  }
}