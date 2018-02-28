const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('../ethereum/build/CampaignFactory');

const provider = new HDWalletProvider(
  'famous indoor link salmon boil apart tiny flight scare before skin then',
  'https://rinkeby.infura.io/1PgmCKFGBQaFp1dC8Cut'
);
const web3 = new Web3(provider);

const deploy = async () => {
  // Get the coinbase
  let accounts = await web3.eth.getAccounts();
  let coinbase = accounts[0];

  console.log(`Deploying Campaign Factory from account: ${coinbase}`);

  // Deploy the contract
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: compiledFactory.bytecode,
    })
    .send({
      from: accounts[0],
      gas: '5000000',
    });

  factory.setProvider(provider);

  console.log(`Campaign Factory deployed at: ${factory.options.address}`);
};

deploy();
